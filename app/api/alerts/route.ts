import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const propertyUrl = process.env.GSC_PROPERTY_URL;
  if (!propertyUrl) {
    return NextResponse.json({ error: "Missing GSC_PROPERTY_URL" }, { status: 500 });
  }

  const { data, error } = await db
    .from("gsc_alerts")
    .select("id, metric_date, severity, title, summary, impact_score, status")
    .eq("property_url", propertyUrl)
    .order("metric_date", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
