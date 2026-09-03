import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-family",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio Sei Bi Boye",
  description: "Portfolio de terrain de Sei Bi Boye Ruchno, ingénieur des techniques agricoles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSerifDisplay.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
