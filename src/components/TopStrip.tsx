'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, Flag } from 'lucide-react';

export default function TopStrip() {
  const handlePhoneClick = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <motion.div 
      className="bg-brand-900 text-white py-3 px-4 border-b border-brand-800 fixed top-0 left-0 right-0 z-40 md:z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="premium-container">
        <div className="hidden sm:flex flex-row items-center justify-between gap-4 text-sm">
          {/* Left side - USA contact */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-brand-600 rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold text-white">US</span>
              </div>
              <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>USA</span>
            </div>
            <motion.button
              onClick={() => handlePhoneClick('+1234567890')}
              className="flex items-center gap-2 hover:text-brand-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="h-4 w-4" />
              <span className="font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>+1 (234) 567-890</span>
            </motion.button>
          </motion.div>

          {/* Center - Business hours */}
          <motion.div 
            className="flex items-center gap-2 text-brand-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Clock className="h-4 w-4" />
            <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Mon-Fri (9am to 5pm CST)</span>
          </motion.div>

          {/* Right side - India contact */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold text-white">IN</span>
              </div>
              <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>India</span>
            </div>
            <motion.button
              onClick={() => handlePhoneClick('+919876543210')}
              className="flex items-center gap-2 hover:text-orange-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="h-4 w-4" />
              <span className="font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>+91 98765 43210</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}