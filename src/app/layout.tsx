import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Advora Services LLP - Your Trusted Partner in Tax & Business Services",
  description: "Advora Services LLP provides expert tax filing and business solutions across the USA & India. Professional tax services, business registrations, and financial consulting.",
  keywords: ["tax services", "business services", "tax filing", "business registration", "Advora Services LLP", "Ramcharan Kotapati", "USA India tax services"],
  authors: [{ name: "Advora Services LLP" }],
  openGraph: {
    title: "Advora Services LLP - Tax & Business Services",
    description: "Expert tax filing and business solutions across the USA & India",
    url: "https://advoraservices.com",
    siteName: "Advora Services LLP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advora Services LLP",
    description: "Your Trusted Partner in Tax & Business Services",
  },
  icons: {
    icon: "/advora-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
