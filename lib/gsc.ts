import { google } from "googleapis";

export type GscRow = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

function getAuthClient() {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GSC_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error("Missing GSC env vars: GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"]
  });
}

export async function fetchGscDaily(propertyUrl: string, startDate: string, endDate: string): Promise<GscRow[]> {
  const auth = getAuthClient();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const response = await searchconsole.searchanalytics.query({
    siteUrl: propertyUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 25000,
      dataState: "all"
    }
  });

  const rows = response.data.rows ?? [];

  return rows
    .filter((row) => Array.isArray(row.keys) && row.keys.length > 0)
    .map((row) => ({
      date: row.keys![0],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0
    }));
}
