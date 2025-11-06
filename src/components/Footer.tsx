import Link from 'next/link';
import { Globe, MapPin, Phone, Building } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-600 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/advora-logo.jpg" alt="Advora Services" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Advora Services</h3>
                <p className="text-sm text-white/80">Tax & Business Solutions</p>
              </div>
            </div>
            <p className="text-sm text-white/80">
              Your trusted partner in tax filing and business services across the USA and India.
            </p>
          </div>

          {/* USA Office */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-brand-200" />
              <h4 className="font-semibold">USA Office</h4>
            </div>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-200" />
                <span>
                  1103 Hidden Ridge<br />
                  Texas, 75038
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-brand-200" />
                <span>+1 (502) 718-0460</span>
              </div>
            </div>
          </div>

          {/* India Office */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-brand-200" />
              <h4 className="font-semibold">India Office</h4>
            </div>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-200" />
                <span>
                  Plot no 22, vivek apartments<br />
                  lal bunglow Road, Ameerpet<br />
                  Hyderabad, 500018
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-brand-200" />
                <span>+91-9491941299</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                Home
              </Link>
              <Link href="/services" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                Services
              </Link>
              <Link href="/about" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                Contact
              </Link>
              <Link href="/faq" className="block text-sm text-white/80 hover:text-brand-200 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-white/80">
              <span>© 2025 Advora Services. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>Built by</span>
              <Link 
                href="#" 
                className="text-brand-200 hover:text-brand-100 font-bold transition-colors"
              >
                Harte Labs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}