import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  Globe
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
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
                <p className="text-sm text-muted-foreground">Tax & Business Solutions</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner in tax filing and business services across the USA and India.
            </p>
          </motion.div>

          {/* USA Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">USA Office</h4>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>
                  1103 Hidden Ridge APT 1012<br />
                  Irving, Texas, 75038
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>+1 (502) 718-0460</span>
              </div>
            </div>
          </motion.div>

          {/* India Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">India Office</h4>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>
                  Plot No 19, 1st floor, Power Nagar<br />
                  Power Nagar Park Road, Moosapet<br />
                  Hyderabad, 500018
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>+91-9700113131</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/services" className="block text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                Services
              </Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                Contact
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                FAQ
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© 2025 Advora Services LLP. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Built by</span>
              <Link 
                href="#" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Harte Labs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}