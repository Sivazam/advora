'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Copy, Check, Clock, X } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-200/50 dark:border-gray-800 overflow-hidden z-10"
        >
          {/* Header Gradient */}
          <div className="relative p-4 sm:p-5 text-white text-center gradient-brand overflow-hidden">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Phone className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-xl font-bold font-raleway text-white tracking-wide">
              Call Advora Services
            </h3>
            <p className="text-amber-100/90 text-xs mt-0.5">
              Speak directly with our expert tax team
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-5 space-y-4" style={{ backgroundColor: '#fcf9f0' }}>
            {/* Display Phone Number Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-amber-300/40 shadow-sm text-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">
                Direct Phone Number
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight my-1">
                {formattedNumber}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border-amber-500/30 transition-all ${
                    copied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 font-semibold'
                      : 'hover:bg-amber-50 text-gray-800 hover:text-amber-900 font-medium'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-700" />
                      <span>Copy Number</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDirectDial}
                  size="sm"
                  className="w-full gradient-brand hover:opacity-95 text-white flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </Button>
              </div>
            </div>

            {/* Business Hours Info */}
            <div className="space-y-2 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg border border-gray-200/60 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 pb-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Working Hours</span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-gray-600 dark:text-gray-300 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">India Office:</span>
                  <span>Mon-Sat: 10AM-7PM IST</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">USA Office:</span>
                  <span>Mon-Fri: 9AM-6PM EST</span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg py-1.5 text-xs"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
