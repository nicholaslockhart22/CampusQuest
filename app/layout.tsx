import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#041E42",
};

export const metadata: Metadata = {
  title: "CampusQuest — Level Up Your Campus Life",
  description: "Turn real life into an RPG. Log workouts, study sessions, and campus life. Earn XP, build stats, and compete on The Quad. URI.",
  openGraph: {
    title: "CampusQuest — Level Up Your Campus Life",
    description: "Turn real life into an RPG. Earn XP, build stats, compete on The Quad.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-uri-navy">
        {children}
      </body>
    </html>
  );
}
