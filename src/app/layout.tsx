import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopStrip from "@/components/TopStrip";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import { NavbarProvider } from "@/contexts/NavbarContext";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Advora Services - Your Trusted Partner in Tax & Business Services",
  description: "Advora Services provides expert tax filing and business solutions across the USA & India. Professional tax services, business registrations, and financial consulting.",
  keywords: ["tax services", "business services", "tax filing", "business registration", "Advora Services", "Ram Chowdhary", "USA India tax services"],
  authors: [{ name: "Advora Services" }],
  openGraph: {
    title: "Advora Services - Tax & Business Services",
    description: "Expert tax filing and business solutions across the USA & India",
    url: "https://advoraservices.com",
    siteName: "Advora Services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advora Services",
    description: "Your Trusted Partner in Tax & Business Services",
  },
  icons: {
    icon: [
      { url: '/advoraLogoRev.png', sizes: 'any' },
      { url: '/advoraLogoRev.png', sizes: '16x16', type: 'image/jpeg' },
      { url: '/advoraLogoRev.png', sizes: '32x32', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/apple-touch-icon.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
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
        className={`${raleway.variable} font-raleway antialiased bg-background text-foreground`}
      >
        <NavbarProvider>
          <div className="min-h-screen" style={{ backgroundColor: '#f7f4c8' }}>
            {/* <TopStrip /> */}
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
          </div>
          <WhatsAppFloating />
          <Toaster />
        </NavbarProvider>
      </body>
    </html>
  );
}
