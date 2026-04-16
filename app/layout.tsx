import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GSC Insight Radar",
  description: "Search Console anomaly intelligence dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
