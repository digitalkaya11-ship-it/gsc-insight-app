import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildTrafficHealthScore } from "@/lib/analytics";

export async function GET() {
  const propertyUrl = process.env.GSC_PROPERTY_URL;
  if (!propertyUrl) {
    return NextResponse.json({ error: "Missing GSC_PROPERTY_URL" }, { status: 500 });
  }

  const { data, error } = await db
    .from("gsc_daily_metrics")
    .select("metric_date, clicks, impressions, ctr, avg_position")
    .eq("property_url", propertyUrl)
    .order("metric_date", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).reverse();
  if (rows.length === 0) {
    return NextResponse.json({ healthScore: 0, rows: [] });
  }

  const current = rows[rows.length - 1];
  const baseline = rows.slice(Math.max(0, rows.length - 8), rows.length - 1);

  return NextResponse.json({
    healthScore: baseline.length ? buildTrafficHealthScore(current, baseline) : 50,
    rows
  });
}
