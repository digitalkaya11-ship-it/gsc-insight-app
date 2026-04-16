export type MetricPoint = {
  metric_date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
};

export type AlertDraft = {
  severity: "high" | "medium" | "low";
  title: string;
  summary: string;
  impactScore: number;
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildTrafficHealthScore(current: MetricPoint, baseline: MetricPoint[]) {
  const baseClicks = average(baseline.map((x) => x.clicks));
  const baseImpressions = average(baseline.map((x) => x.impressions));
  const basePosition = average(baseline.map((x) => x.avg_position));

  if (baseClicks === 0 || baseImpressions === 0) return 50;

  const clickDelta = (current.clicks - baseClicks) / baseClicks;
  const impressionDelta = (current.impressions - baseImpressions) / baseImpressions;
  const positionDelta = basePosition === 0 ? 0 : (basePosition - current.avg_position) / basePosition;

  const raw = 70 + clickDelta * 20 + impressionDelta * 5 + positionDelta * 5;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function detectAlert(current: MetricPoint, baseline: MetricPoint[]): AlertDraft | null {
  if (baseline.length < 7) return null;

  const baseClicks = average(baseline.map((x) => x.clicks));
  const baseImpressions = average(baseline.map((x) => x.impressions));
  const basePosition = average(baseline.map((x) => x.avg_position));

  if (baseClicks === 0 || baseImpressions === 0) return null;

  const clickDropPct = ((baseClicks - current.clicks) / baseClicks) * 100;
  const impressionDropPct = ((baseImpressions - current.impressions) / baseImpressions) * 100;
  const positionWorsen = current.avg_position - basePosition;

  const impactScore = Math.max(0, Math.round((baseClicks - current.clicks) * 1.5));

  if (clickDropPct >= 25 && impressionDropPct < 10 && positionWorsen >= 1.2) {
    return {
      severity: "high",
      title: "Ranking drop likely",
      summary: `Clicks down ${clickDropPct.toFixed(1)}% while impressions stable. Avg position worsened by ${positionWorsen.toFixed(2)}.`,
      impactScore
    };
  }

  if (clickDropPct >= 20) {
    return {
      severity: "medium",
      title: "Traffic anomaly detected",
      summary: `Clicks down ${clickDropPct.toFixed(1)}% vs 7-day baseline.`,
      impactScore
    };
  }

  if (current.clicks > baseClicks * 1.3) {
    return {
      severity: "low",
      title: "Positive spike",
      summary: `Clicks up ${(((current.clicks - baseClicks) / baseClicks) * 100).toFixed(1)}% vs baseline.`,
      impactScore: 0
    };
  }

  return null;
}
