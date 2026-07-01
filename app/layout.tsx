import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { BlurTop } from "@/components/layout/BlurTop";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  title: "DevSoc Registrations",
  description: "Register for Developer Society, Christ University."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="overflow-x-clip">
        <BlurTop />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
