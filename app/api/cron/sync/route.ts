import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchGscDaily } from "@/lib/gsc";
import { detectAlert } from "@/lib/analytics";

function assertCronAuth(req: Request) {
  const incoming = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || incoming !== `Bearer ${secret}`) {
    throw new Error("Unauthorized");
  }
}

export async function POST(req: Request) {
  try {
    assertCronAuth(req);

    const propertyUrl = process.env.GSC_PROPERTY_URL;
    if (!propertyUrl) {
      return NextResponse.json({ error: "Missing GSC_PROPERTY_URL" }, { status: 500 });
    }

    const end = new Date();
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 29);

    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const rows = await fetchGscDaily(propertyUrl, startDate, endDate);

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, alerts: 0 });
    }

    const upsertPayload = rows.map((row) => ({
      property_url: propertyUrl,
      metric_date: row.date,
      clicks: Math.round(row.clicks),
      impressions: Math.round(row.impressions),
      ctr: Number(row.ctr.toFixed(5)),
      avg_position: Number(row.position.toFixed(3))
    }));

    const { error: upsertError } = await db
      .from("gsc_daily_metrics")
      .upsert(upsertPayload, { onConflict: "property_url,metric_date" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    const sorted = [...upsertPayload].sort((a, b) => a.metric_date.localeCompare(b.metric_date));
    const current = sorted[sorted.length - 1];
    const baseline = sorted.slice(-8, -1);

    let alertsInserted = 0;
    const alert = detectAlert(current, baseline);
    if (alert) {
      const { error: alertError } = await db.from("gsc_alerts").insert({
        property_url: propertyUrl,
        metric_date: current.metric_date,
        severity: alert.severity,
        title: alert.title,
        summary: alert.summary,
        impact_score: alert.impactScore
      });

      if (!alertError) alertsInserted = 1;
    }

    return NextResponse.json({ ok: true, inserted: upsertPayload.length, alerts: alertsInserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
