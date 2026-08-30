import type { Metadata } from "next";
import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const share = Share_Tech_Mono({
  variable: "--font-share",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "HERMES — Neural Command Center",
  description:
    "Fully functional Jarvis-class neural command dashboard with a live holographic brain, agent constellation, and voice-ready cognitive layer.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${rajdhani.variable} ${share.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
