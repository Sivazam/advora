'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const scrollPercentage = (scrollTop / windowHeight) * 100;
      
      // Trigger rounded navbar after 30% of screen height scroll (smoother transition)
      setIsScrolled(scrollPercentage > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={`hidden md:block fixed z-50 ${
        isScrolled 
          ? 'top-4 left-0 right-0' 
          : 'top-12 left-0 right-0'
      }`}>
        <motion.div
          className={`relative mx-auto ${
            isScrolled 
              ? 'bg-white border border-gray-200 rounded-full px-12 py-3 shadow-lg max-w-4xl'
              : 'bg-white border-b border-gray-200 px-6 py-4'
          }`}
          initial={false}
          animate={{
            scaleX: isScrolled ? [0.3, 1] : [1, 1],
            scaleY: isScrolled ? [0.3, 1] : [1, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 18,
            mass: 1.5,
            restDelta: 0.001,
            transformOrigin: "center center"
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200"
                whileHover={{ 
                  scale: 1.08,
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 0.4, ease: "easeInOut" }
                }}
                whileTap={{ 
                  scale: 0.92,
                  transition: { duration: 0.1, ease: "easeOut" }
                }}
              >
                <img 
                  src="/advora-logo.jpg" 
                  alt="Advora Services LLP" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="ml-3 overflow-hidden"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  width: 'auto', 
                  x: 0 
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.4, 0, 0.2, 1],
                  width: { duration: 0.6, ease: "easeInOut" }
                }}
              >
                <div>
                  <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Advora</span>
                  <span className="text-xs text-gray-500 block" style={{ fontFamily: 'Inter, sans-serif' }}>Services LLP</span>
                </div>
              </motion.div>
            </Link>

            {/* Navigation Links */}
            <div className={`flex items-center ${isScrolled ? 'ml-8' : 'ml-0'} space-x-1`}>
              {navItems.map((item, index) => (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden"
                    whileHover={{ 
                      scale: 1.08,
                      y: -2,
                      transition: { 
                        duration: 0.3, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }
                    }}
                    whileTap={{ 
                      scale: 0.96,
                      transition: { duration: 0.15, ease: "easeIn" }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: [0.25, 0.1, 0.25, 1] // Smooth cubic bezier
                    }}
                  >
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.div
                        className="absolute inset-0 bg-blue-100 rounded-lg"
                        layoutId="navbar-fill"
                        initial={false}
                        transition={{ 
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                          mass: 1.5,
                          restDelta: 0.001,
                          duration: 0.8
                        }}
                      />
                    )}
                    
                    {/* Text */}
                    <span className={`relative z-10 transition-all duration-400 ${
                      pathname === item.href
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700 hover:text-gray-900'
                    }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
              <img 
                src="/advora-logo.jpg" 
                alt="Advora Services LLP" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 font-premium-accent">Advora</span>
              <span className="text-xs text-gray-500 block font-premium-body">Services LLP</span>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1], // Custom cubic bezier
                height: { type: "spring", stiffness: 300, damping: 30 }
              }}
              className="border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-2 space-y-1">
                {navItems.map((item, index) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      whileHover={{ 
                        scale: 1.03,
                        x: 4,
                        transition: { 
                          duration: 0.2, 
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 500,
                          damping: 20
                        }
                      }}
                      whileTap={{ 
                        scale: 0.97,
                        transition: { duration: 0.1, ease: "easeIn" }
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                    >
                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>{item.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}