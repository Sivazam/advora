'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Copy, Check, Clock, MapPin, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  formattedNumber?: string;
}

export default function PhoneCallModal({
  isOpen,
  onClose,
  phoneNumber = "+919493395299",
  formattedNumber = "+91 94933 95299"
}: PhoneCallModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectDial = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-200/50 dark:border-gray-800 overflow-hidden z-10"
        >
          {/* Header Gradient */}
          <div className="relative p-6 text-white text-center gradient-brand overflow-hidden">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Phone className="w-8 h-8 text-white animate-bounce" />
            </div>

            <h3 className="text-2xl font-bold font-raleway text-white tracking-wide">
              Call Advora Services
            </h3>
            <p className="text-amber-100 text-sm mt-1">
              Speak directly with our expert team
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6" style={{ backgroundColor: '#fcf9f0' }}>
            {/* Display Phone Number Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-amber-300/40 shadow-sm text-center">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold block mb-1">
                Direct Contact Number
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight my-1">
                {formattedNumber}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-amber-500/30 transition-all ${
                    copied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 font-medium'
                      : 'hover:bg-amber-50 text-gray-800 hover:text-amber-900'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-700" />
                      <span>Copy Number</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDirectDial}
                  className="w-full gradient-brand hover:opacity-95 text-white flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call App</span>
                </Button>
              </div>
            </div>

            {/* Business Hours Info */}
            <div className="space-y-3 bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200/60 text-sm">
              <div className="flex items-center gap-2.5 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 pb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Office Working Hours</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-gray-600 dark:text-gray-300 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">India Office:</span>
                  <span>Mon - Sat: 10:00 AM - 7:00 PM IST</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">USA Office:</span>
                  <span>Mon - Fri: 9:00 AM - 6:00 PM EST</span>
                </div>
              </div>
            </div>

            {/* Close / Dismiss button */}
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 rounded-xl py-2 text-sm"
            >
              Close Window
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
