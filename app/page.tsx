"use client";

import { useEffect, useMemo, useState } from "react";

type Metric = {
  metric_date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
};

type AlertRow = {
  id: number;
  metric_date: string;
  severity: "high" | "medium" | "low";
  title: string;
  summary: string;
  impact_score: number;
  status: string;
};

export default function HomePage() {
  const [healthScore, setHealthScore] = useState(0);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/metrics"), fetch("/api/alerts")])
      .then(async ([m, a]) => {
        const metricsJson = await m.json();
        const alertsJson = await a.json();

        setHealthScore(metricsJson.healthScore ?? 0);
        setMetrics(metricsJson.rows ?? []);
        setAlerts(alertsJson.rows ?? []);
      })
      .catch(() => {
        setHealthScore(0);
        setMetrics([]);
        setAlerts([]);
      });
  }, []);

  const current = metrics[metrics.length - 1];
  const totalClicks = useMemo(() => metrics.reduce((sum, row) => sum + row.clicks, 0), [metrics]);

  const maxClicks = Math.max(...metrics.map((x) => x.clicks), 1);

  return (
    <main>
      <h1>GSC Insight Radar</h1>
      <p>Auto analysis of organic traffic changes, anomaly dates, and business impact.</p>

      <section className="grid" style={{ marginTop: 20 }}>
        <article className="card kpi">
          <p>Traffic Health Score</p>
          <h2>{healthScore}/100</h2>
        </article>

        <article className="card kpi">
          <p>Last Day Clicks</p>
          <h2>{current?.clicks ?? 0}</h2>
        </article>

        <article className="card kpi">
          <p>Last Day Impressions</p>
          <h2>{current?.impressions ?? 0}</h2>
        </article>

        <article className="card kpi">
          <p>30-Day Clicks</p>
          <h2>{totalClicks}</h2>
        </article>

        <article className="card wide">
          <h3>Clicks Trend</h3>
          <div className="spark" aria-label="Clicks sparkline">
            {metrics.map((row) => (
              <span
                key={row.metric_date}
                title={`${row.metric_date}: ${row.clicks}`}
                style={{ height: `${Math.max(8, (row.clicks / maxClicks) * 100)}%` }}
              />
            ))}
          </div>
        </article>

        <article className="card side">
          <h3>Latest Alerts</h3>
          <div className="alert-list">
            {alerts.length === 0 ? <p>No alerts yet.</p> : null}
            {alerts.slice(0, 5).map((alert) => (
              <div className="alert-item" key={alert.id}>
                <span className={`badge ${alert.severity}`}>{alert.severity.toUpperCase()}</span>
                <p style={{ marginBottom: 4 }}><strong>{alert.title}</strong></p>
                <p style={{ margin: "4px 0" }}>{alert.summary}</p>
                <p style={{ margin: 0 }}>
                  {alert.metric_date} | Impact score: {alert.impact_score}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="card full">
          <h3>Daily Metrics Table</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clicks</th>
                <th>Impressions</th>
                <th>CTR</th>
                <th>Avg Position</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.metric_date}>
                  <td>{row.metric_date}</td>
                  <td>{row.clicks}</td>
                  <td>{row.impressions}</td>
                  <td>{(row.ctr * 100).toFixed(2)}%</td>
                  <td>{row.avg_position.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}
