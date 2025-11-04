'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

const NavbarComponent = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleNavigation = (href: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    // Simple logic: Only show animations on page refresh
    // Check if this is a page refresh
    const navigationEntries = performance.getEntriesByType('navigation');
    const navigationType = navigationEntries[0]?.type;
    
    // Only allow animations on page refresh or back/forward
    const isPageRefresh = navigationType === 'reload' || navigationType === 'back_forward';
    
    setHasAnimated(!isPageRefresh);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav 
        className="hidden md:block fixed z-50 top-6 left-0 right-0"
        initial={!hasAnimated ? { y: -100, opacity: 0 } : false}
        animate={!hasAnimated ? { y: 0, opacity: 1 } : false}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut"
        }}
      >
        <div
          className="relative mx-auto bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-full px-8 py-4 shadow-2xl max-w-5xl"
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <motion.div
                className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-brand-200 shadow-md group-hover:shadow-xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 0.6, ease: "easeInOut" }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                initial={!hasAnimated ? { opacity: 0 } : false}
                animate={!hasAnimated ? { opacity: 1 } : false}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              >
                <img 
                  src="/advora-logo.jpg" 
                  alt="Advora Services" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div 
                className="ml-4"
                initial={!hasAnimated ? { x: -10, opacity: 0 } : false}
                animate={!hasAnimated ? { x: 0, opacity: 1 } : false}
                transition={{ delay: !hasAnimated ? 0.5 : 0, duration: 0.5 }}
              >
                <div>
                  <span className="text-2xl font-black text-gray-900 font-raleway-heading group-hover:text-brand-600 transition-colors duration-300 uppercase">Advora</span>
                  <span className="text-sm text-gray-500 block font-raleway group-hover:text-brand-500 transition-colors duration-300">Services</span>
                </div>
              </motion.div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2 ml-12">
              {navItems.map((item, index) => (
                <Link key={item.name} href={item.href} prefetch={true} onClick={() => handleNavigation(item.href)}>
                  <motion.div
                    className="relative px-5 py-3 rounded-2xl text-sm font-medium overflow-hidden group"
                    initial={!hasAnimated ? { opacity: 0, y: -20 } : false}
                    animate={!hasAnimated ? { opacity: 1, y: 0 } : false}
                    transition={{ 
                      delay: !hasAnimated ? index * 0.1 + 0.8 : 0,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -3,
                      transition: { 
                        duration: 0.3, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.15, ease: "easeIn" }
                    }}
                  >
                    {/* Background hover effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-brand-100 to-brand-200 rounded-2xl"
                        layoutId="navbar-fill"
                        initial={false}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 0.8,
                          restDelta: 0.001,
                        }}
                      />
                    )}
                    
                    {/* Badge that flows through menu items */}
                    {pathname === item.href && (
                      <motion.div
                        className="absolute inset-0 bg-[#916f2a] rounded-2xl"
                        layoutId="navbar-badge"
                        initial={false}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 0.8,
                          restDelta: 0.001,
                        }}
                      />
                    )}
                    
                    {/* Text */}
                    <span className={`relative z-10 transition-all duration-300 font-raleway-accent text-base font-semibold ${
                      pathname === item.href
                        ? 'text-white font-bold'
                        : 'text-gray-700 group-hover:text-brand-600 font-semibold'
                    }`}>
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav 
        className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300"
        initial={!hasAnimated ? { y: -100, opacity: 0 } : false}
        animate={!hasAnimated ? { y: 0, opacity: 1 } : false}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut"
        }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-brand-200 shadow-md group-hover:shadow-lg transition-all duration-300"
              whileHover={{ 
                scale: 1.1,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.4, ease: "easeInOut" }
              }}
            >
              <img 
                src="/advora-logo.jpg" 
                alt="Advora Services" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div>
              <span className="text-lg font-black text-gray-900 font-raleway-heading group-hover:text-brand-600 transition-colors duration-300 uppercase">Advora</span>
              <span className="text-xs text-gray-500 block font-raleway group-hover:text-brand-500 transition-colors duration-300">Services</span>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="rounded-xl text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1],
                height: { type: "spring", stiffness: 300, damping: 30 }
              }}
              className="border-t border-gray-200/50 bg-white/95 backdrop-blur-md"
            >
              <div className="px-4 py-3 space-y-2">
                {navItems.map((item, index) => (
                  <Link key={item.name} href={item.href} onClick={() => handleNavigation(item.href)} prefetch={true}>
                    <motion.div
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700 font-bold'
                          : 'text-gray-700 hover:text-brand-600 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100 font-semibold'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.02,
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
                        scale: 0.98,
                        transition: { duration: 0.1, ease: "easeIn" }
                      }}
                    >
                      <span className="font-raleway-accent">{item.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

// Memoize the navbar to prevent remounting on route changes
export default memo(NavbarComponent);