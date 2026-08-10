'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Globe, 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Clock, 
  Share2, 
  Check, 
  ExternalLink,
  Sparkles,
  Award,
  Building2
} from 'lucide-react';
import PhoneCallModal from '@/components/PhoneCallModal';
import { Button } from '@/components/ui/button';

export default function ConnectPage() {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const phoneNumber = "+919493395299";
  const formattedPhoneNumber = "+91 94933 95299";
  const whatsappQueryMessage = encodeURIComponent("Hi Advora! my query is - ");
  const whatsappUrl = `https://wa.me/919493395299?text=${whatsappQueryMessage}`;
  const websiteUrl = "https://advoraservices.com/";

  // Detect mobile / telephony capabilities
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobileDevice(mobileRegex.test(userAgent) || (isTouch && window.innerWidth <= 768));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCallClick = () => {
    if (isMobileDevice) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      setIsPhoneModalOpen(true);
    }
  };

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWebsiteClick = () => {
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Advora Services - Reach Out',
        text: 'Connect with Advora Services for expert tax and business solutions.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between" style={{ backgroundColor: '#f7f4c8' }}>
      
      {/* Phone Modal for Desktop */}
      <PhoneCallModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phoneNumber={phoneNumber}
        formattedNumber={formattedPhoneNumber}
      />

      <div className="max-w-xl mx-auto w-full space-y-6">
        
        {/* Top Header Card / Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-200/60 dark:border-gray-700"
        >
          {/* Share Button Top Right */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-amber-100/60 hover:bg-amber-200/80 text-amber-900 transition-all duration-200 shadow-sm flex items-center justify-center"
            title="Share this page"
            aria-label="Share page"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 text-amber-800" />
            )}
          </button>

          {/* Logo & Avatar */}
          <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-white rounded-2xl shadow-md p-2 border border-amber-100">
            <img
              src="/navLogo.webp"
              alt="Advora Services Logo"
              width={80}
              height={80}
              className="w-full h-full object-contain"
              loading="eager"
              // @ts-ignore
              fetchPriority="high"
            />
          </div>

          {/* Verified Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wide mb-3 border border-amber-300/50">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Official Advora Reachout Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-raleway tracking-tight">
            Advora Services
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
            Your Trusted Partner in US & India Tax Filing, Business Registrations & Financial Solutions.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-amber-100 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg border border-amber-200/40">
              <Sparkles className="w-3 h-3 text-amber-600" /> Instant Support
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg border border-amber-200/40">
              <Award className="w-3 h-3 text-amber-600" /> Tax Experts
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg border border-amber-200/40">
              <Building2 className="w-3 h-3 text-amber-600" /> USA & India
            </span>
          </div>
        </motion.div>

        {/* 3 PRIMARY ACTION CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >

          {/* ACTION 1: CALL BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCallClick}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between text-left border border-amber-600/30"
          >
            <div className="flex items-center space-x-4">
              <div className="w-13 h-13 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner group-hover:bg-white/30 transition-colors">
                <Phone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-raleway text-white">Call Advora</span>
                  <span className="bg-amber-500/40 text-amber-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    {isMobileDevice ? "Tap to Dial" : "View Number"}
                  </span>
                </div>
                <p className="text-amber-100/90 text-xs sm:text-sm mt-0.5">
                  Direct phone assistance with tax consultants
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* ACTION 2: WHATSAPP BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsAppClick}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between text-left border border-emerald-500/30"
          >
            <div className="flex items-center space-x-4">
              <div className="w-13 h-13 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner group-hover:bg-white/30 transition-colors relative">
                {/* WhatsApp SVG Icon */}
                <svg
                  className="w-6 h-6 fill-current text-white group-hover:scale-110 transition-transform duration-300"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-raleway text-white">WhatsApp Chat</span>
                  <span className="bg-emerald-500/40 text-emerald-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Instant Chat
                  </span>
                </div>
                <p className="text-emerald-100/90 text-xs sm:text-sm mt-0.5">
                  Sends pre-filled message: "Hi Advora! my query is -"
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* ACTION 3: WEBSITE BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWebsiteClick}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-900 via-stone-900 to-gray-800 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between text-left border border-gray-700/50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-13 h-13 bg-amber-500/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner group-hover:bg-amber-500/30 transition-colors">
                <Globe className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-raleway text-white">Visit Website</span>
                  <span className="bg-gray-700/80 text-amber-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-gray-600">
                    advoraservices.com
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-0.5">
                  Explore full range of services, pricing & info
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <ExternalLink className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.button>

        </motion.div>

        {/* Quick Contact & Office Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-6 shadow-md border border-amber-200/50 space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-raleway flex items-center gap-2 border-b border-amber-100 pb-3">
            <Mail className="w-4 h-4 text-amber-700" />
            <span>Direct Email & Office Addresses</span>
          </h3>

          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-900 dark:text-white block">Email Inquiry</span>
                <a 
                  href="mailto:info@advoraservices.com" 
                  className="text-amber-800 dark:text-amber-400 hover:underline font-medium"
                >
                  info@advoraservices.com
                </a>
              </div>
            </div>

            {/* India Office */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-900 dark:text-white block">India Office (Hyderabad)</span>
                <p className="text-gray-600 dark:text-gray-400">
                  Plot no 22, Vivek Apartments, Lal Bunglow Road, Ameerpet, Hyderabad, 500018
                </p>
              </div>
            </div>

            {/* USA Office */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-900 dark:text-white block">USA Office (Texas)</span>
                <p className="text-gray-600 dark:text-gray-400">
                  1103 Hidden Ridge, Texas, 75038
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-3 pt-2 border-t border-amber-100/70">
              <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-900 dark:text-white block">Working Hours</span>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Mon-Sat: 10:00 AM - 7:00 PM IST | Mon-Fri: 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center pt-2 pb-4 text-xs text-gray-600 dark:text-gray-400 space-y-2"
        >
          <p>© {new Date().getFullYear()} Advora Services. All rights reserved.</p>
          <div className="flex justify-center items-center gap-4 text-amber-800 dark:text-amber-400 font-medium">
            <Link href="/" className="hover:underline">Home</Link>
            <span>•</span>
            <Link href="/about" className="hover:underline">About Us</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
