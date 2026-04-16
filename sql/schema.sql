create table if not exists gsc_daily_metrics (
  id bigint generated always as identity primary key,
  property_url text not null,
  metric_date date not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric(8,5) not null default 0,
  avg_position numeric(8,3) not null default 0,
  created_at timestamptz not null default now(),
  unique (property_url, metric_date)
);

create table if not exists gsc_alerts (
  id bigint generated always as identity primary key,
  property_url text not null,
  metric_date date not null,
  severity text not null,
  title text not null,
  summary text not null,
  impact_score numeric(10,2) not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_gsc_metrics_property_date on gsc_daily_metrics(property_url, metric_date desc);
create index if not exists idx_gsc_alerts_property_date on gsc_alerts(property_url, metric_date desc);
