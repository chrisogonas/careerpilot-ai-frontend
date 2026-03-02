import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import GracePeriodBanner from "./components/GracePeriodBanner";
import ReminderBanner from "./components/ReminderBanner";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerPilot AI",
  description: "AI-powered career development platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Sidebar />
          <div className="pt-14">
            <GracePeriodBanner />
            <ReminderBanner />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
