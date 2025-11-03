import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import TopStrip from "@/components/TopStrip";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFloating from "@/components/WhatsAppFloating";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
    icon: [
      { url: '/advora-logo.jpg', sizes: 'any' },
      { url: '/favicon-16x16.jpg', sizes: '16x16', type: 'image/jpeg' },
      { url: '/favicon-32x32.jpg', sizes: '32x32', type: 'image/jpeg' },
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
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50">
          <TopStrip />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-brand-600 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src="/advora-logo.jpg" 
                        alt="Advora Services LLP" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Advora Services LLP</h3>
                      <p className="text-sm text-white/80">Tax & Business Solutions</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80">
                    Your trusted partner in tax filing and business services across the USA and India.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Links</h4>
                  <div className="space-y-2">
                    <a href="/" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                      Home
                    </a>
                    <a href="/services" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                      Services
                    </a>
                    <a href="/about" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                      About Us
                    </a>
                    <a href="/contact" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                      Contact
                    </a>
                    <a href="/faq" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                      FAQ
                    </a>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Contact Info</h4>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <span>🇺🇸 USA: +1 (502) 718-0460</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🇮🇳 India: +91-9700113131</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📧 usa@advoraservices.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="text-sm text-white/80">
                    <span>© 2025 Advora Services LLP. All rights reserved.</span>
                  </div>
                  <div className="text-sm text-white/80">
                    <span>Built with ❤️ for your business needs</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
          <ScrollToTop />
        </div>
        <WhatsAppFloating />
        <Toaster />
      </body>
    </html>
  );
}
