import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "SinagCalc PH — Rooftop Solar Calculator",
  description: "Find out if solar is worth it for your Filipino home. Get a personalized estimate for system size, cost, ROI, and environmental impact.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
