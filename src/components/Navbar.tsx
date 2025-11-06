'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useNavbar } from '@/contexts/NavbarContext';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

// Global flag to prevent navbar re-animation across the entire application
declare global {
  interface Window {
    __NAVBAR_ANIMATED__?: boolean;
  }
}

const NavbarComponent = () => {
  const pathname = usePathname();
  const { hasAnimated, setHasAnimated } = useNavbar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [flowingBadgePosition, setFlowingBadgePosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [instantActiveIndex, setInstantActiveIndex] = useState<number | null>(null);
  const navRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previousPathRef = useRef(pathname);
  const animationRef = useRef<number | null>(null);

  const handleNavigation = (href: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // Get element position relative to viewport with fallback
  const getElementPosition = (element: HTMLElement) => {
    try {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    } catch (error) {
      console.warn('Failed to get element position:', error);
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }
  };

  // Rubber band animation function
  const animateRubberBand = (startPos: { x: number; y: number; width: number; height: number }, 
                            endPos: { x: number; y: number; width: number; height: number },
                            onSuccess?: () => void) => {
    const startTime = Date.now();
    const duration = 800; // Total animation duration
    const intermediatePositions: { x: number; y: number; width: number; height: number }[] = [];
    
    // Calculate intermediate positions (rubber band effect points)
    const currentIndex = navItems.findIndex(item => item.href === previousPathRef.current);
    const targetIndex = navItems.findIndex(item => item.href === pathname);
    
    if (currentIndex !== -1 && targetIndex !== -1) {
      const direction = targetIndex > currentIndex ? 1 : -1;
      
      // Add intermediate menu positions for rubber band effect
      for (let i = currentIndex + direction; i !== targetIndex + direction; i += direction) {
        const intermediateElement = navRefs.current[i];
        if (intermediateElement) {
          const pos = getElementPosition(intermediateElement);
          // Validate intermediate position
          if (pos.x !== 0 || pos.y !== 0) {
            intermediatePositions.push(pos);
          }
        }
      }
    }
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for rubber band effect
      const easeOutElastic = (t: number) => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
      };
      
      const easedProgress = easeOutElastic(progress);
      
      if (progress <= 0.3) {
        // First phase: stretch towards intermediate positions
        const stretchProgress = progress / 0.3;
        let currentPos = startPos;
        
        if (intermediatePositions.length > 0) {
          // Calculate position along the rubber band path
          const totalSegments = intermediatePositions.length + 1;
          const currentSegment = Math.floor(stretchProgress * totalSegments);
          const segmentProgress = (stretchProgress * totalSegments) % 1;
          
          if (currentSegment === 0) {
            // From start to first intermediate
            currentPos = {
              x: startPos.x + (intermediatePositions[0].x - startPos.x) * segmentProgress,
              y: startPos.y + (intermediatePositions[0].y - startPos.y) * segmentProgress,
              width: startPos.width + (intermediatePositions[0].width - startPos.width) * segmentProgress,
              height: startPos.height + (intermediatePositions[0].height - startPos.height) * segmentProgress
            };
          } else if (currentSegment < intermediatePositions.length) {
            // Between intermediate positions
            const fromPos = intermediatePositions[currentSegment - 1];
            const toPos = intermediatePositions[currentSegment];
            currentPos = {
              x: fromPos.x + (toPos.x - fromPos.x) * segmentProgress,
              y: fromPos.y + (toPos.y - fromPos.y) * segmentProgress,
              width: fromPos.width + (toPos.width - fromPos.width) * segmentProgress,
              height: fromPos.height + (toPos.height - fromPos.height) * segmentProgress
            };
          } else {
            // From last intermediate to end
            const lastIntermediate = intermediatePositions[intermediatePositions.length - 1];
            currentPos = {
              x: lastIntermediate.x + (endPos.x - lastIntermediate.x) * segmentProgress,
              y: lastIntermediate.y + (endPos.y - lastIntermediate.y) * segmentProgress,
              width: lastIntermediate.width + (endPos.width - lastIntermediate.width) * segmentProgress,
              height: lastIntermediate.height + (endPos.height - lastIntermediate.height) * segmentProgress
            };
          }
        }
        
        setFlowingBadgePosition(currentPos);
      } else {
        // Second phase: snap to final position with elastic effect
        setFlowingBadgePosition(endPos);
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setTimeout(() => {
          setFlowingBadgePosition(null);
          setIsAnimating(false);
          setInstantActiveIndex(null);
          previousPathRef.current = pathname;
          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }
        }, 50);
      }
    };
    
    // Start animation with a fallback
    try {
      animate();
    } catch (error) {
      console.warn('Rubber band animation failed:', error);
      // Fallback: just complete the animation
      setFlowingBadgePosition(null);
      setIsAnimating(false);
      setInstantActiveIndex(null);
      previousPathRef.current = pathname;
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  // Handle rubber band animation
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.href === pathname);
    const previousIndex = navItems.findIndex(item => item.href === previousPathRef.current);
    
    if (currentIndex !== previousIndex && previousIndex !== -1 && currentIndex !== -1 && !isAnimating) {
      setIsAnimating(true);
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Rubber band animation triggered:', {
          currentIndex,
          previousIndex,
          pathname,
          previousPath: previousPathRef.current
        });
      }
      
      // Reset any existing instant active index first
      setInstantActiveIndex(null);
      
      // Set instant active index immediately for text color change
      setTimeout(() => {
        setInstantActiveIndex(currentIndex);
      }, 10);
      
      // Use a more reliable approach for getting element positions
      const startElement = navRefs.current[previousIndex];
      const endElement = navRefs.current[currentIndex];
      
      if (startElement && endElement) {
        // HYBRID APPROACH: Try rubber band first, fallback to simple if it fails
        tryRubberBandAnimation(startElement, endElement);
      } else {
        // Elements not found
        if (process.env.NODE_ENV === 'development') {
          console.warn('Navigation elements not found:', { startElement, endElement });
        }
        setIsAnimating(false);
        setInstantActiveIndex(null);
        previousPathRef.current = pathname;
      }
    } else if (currentIndex === -1) {
      // Reset if no matching route
      setFlowingBadgePosition(null);
      setIsAnimating(false);
      setInstantActiveIndex(null);
      previousPathRef.current = pathname;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pathname, isAnimating]);

  // Hybrid animation function that tries rubber band first, then falls back
  const tryRubberBandAnimation = (startElement: HTMLElement, endElement: HTMLElement) => {
    const isProduction = process.env.NODE_ENV === 'production';
    let animationTimeout: NodeJS.Timeout;
    let fallbackTimeout: NodeJS.Timeout;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Starting hybrid animation approach (Production:', isProduction, ')');
    }
    
    // Set a timeout to fallback if rubber band doesn't work
    fallbackTimeout = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⏰ Rubber band animation timeout, falling back to simple animation');
      }
      // Clear any pending rubber band animation
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Use simple animation as fallback
      performSimpleAnimation(startElement, endElement);
    }, isProduction ? 2000 : 3000); // Shorter timeout in production
    
    // Try the rubber band animation
    try {
      // Ensure elements are properly measured
      requestAnimationFrame(() => {
        const startPos = getElementPosition(startElement);
        const endPos = getElementPosition(endElement);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('📍 Element positions:', { startPos, endPos });
        }
        
        // Validate positions before proceeding
        if (startPos.x === 0 && startPos.y === 0 && endPos.x === 0 && endPos.y === 0) {
          // Fallback: skip animation if positions are invalid
          if (process.env.NODE_ENV === 'development') {
            console.warn('❌ Invalid positions, falling back to simple animation');
          }
          clearTimeout(fallbackTimeout);
          performSimpleAnimation(startElement, endElement);
          return;
        }
        
        setTargetPosition(endPos);
        setFlowingBadgePosition(startPos);
        
        // Start rubber band animation with a more reliable delay
        animationTimeout = setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🎬 Starting rubber band animation...');
          }
          try {
            animateRubberBand(startPos, endPos, () => {
              // Success callback - clear fallback timeout
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Rubber band animation completed successfully!');
              }
              clearTimeout(fallbackTimeout);
            });
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('💥 Rubber band animation failed, falling back to simple animation:', error);
            }
            clearTimeout(fallbackTimeout);
            performSimpleAnimation(startElement, endElement);
          }
        }, isProduction ? 150 : 100); // Slightly longer delay in production
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🚨 Error setting up rubber band animation, falling back to simple animation:', error);
      }
      clearTimeout(fallbackTimeout);
      performSimpleAnimation(startElement, endElement);
    }
  };

  // Simple animation fallback
  const performSimpleAnimation = (startElement: HTMLElement, endElement: HTMLElement) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performing simple animation fallback');
    }
    
    setFlowingBadgePosition(getElementPosition(startElement));
    
    setTimeout(() => {
      const endPos = getElementPosition(endElement);
      if (endPos.x !== 0 || endPos.y !== 0) {
        setFlowingBadgePosition(endPos);
        setTimeout(() => {
          setFlowingBadgePosition(null);
          setIsAnimating(false);
          setInstantActiveIndex(null);
          previousPathRef.current = pathname;
        }, 200);
      } else {
        // Fallback if position is invalid
        setFlowingBadgePosition(null);
        setIsAnimating(false);
        setInstantActiveIndex(null);
        previousPathRef.current = pathname;
      }
    }, 50);
  };

  // Animation state management
  useEffect(() => {
    // Only animate on first load if not already animated
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
        setIsInitialLoad(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsInitialLoad(false);
    }
  }, [hasAnimated, setHasAnimated]);

  // Additional safeguard: always ensure hasAnimated is true on pathname changes
  useEffect(() => {
    // Force hasAnimated to true on any route change after initial load
    if (hasAnimated) {
      return; // Already animated, no need to do anything
    }
    
    // If somehow hasAnimated is false during navigation, set it to true immediately
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [pathname, hasAnimated]);

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
              <div
                className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-brand-200 shadow-md"
              >
                <img 
                  src="/advora-logo.jpg" 
                  alt="Advora Services" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 leading-tight">
                <div>
                  <span className="text-2xl font-black font-raleway-heading group-hover:text-brand-600 transition-colors duration-300 uppercase" style={{ fontWeight: 800, color: '#424242' }}>Advora</span>
                  <div className="my-0.5 h-px w-full" style={{ backgroundColor: '#916f2a' }}></div>
                  <span className="text-sm font-raleway group-hover:text-brand-500 transition-colors duration-300 leading-none block text-center" style={{ color: '#424242' }}>Services</span>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2 ml-12">
              {navItems.map((item, index) => (
                <div key={item.name} ref={el => navRefs.current[index] = el}>
                  <Link href={item.href} prefetch={true} onClick={() => handleNavigation(item.href)}>
                    <motion.div
                      className="relative px-5 py-3 rounded-full text-sm font-medium overflow-hidden group"
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
                        className="absolute inset-0 bg-gradient-to-r from-brand-50 to-brand-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      
                      {/* Static active badge (shown when not animating) */}
                      {!isAnimating && pathname === item.href && (
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-[#916f2a] to-[#7a5d24] rounded-full shadow-lg flex items-center justify-center"
                        >
                          <span className="text-white font-bold font-raleway-accent text-base">
                            {item.name}
                          </span>
                        </div>
                      )}
                      
                      {/* Text (shown when not active) */}
                      <span className={`relative z-10 font-raleway-accent text-base font-semibold transition-all duration-0 ${
                        instantActiveIndex === index
                          ? 'opacity-0 pointer-events-none'
                          : pathname === item.href
                          ? 'opacity-0 pointer-events-none'
                          : 'font-semibold'
                      }`} style={{ color: '#424242' }}>
                        {item.name}
                      </span>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Rubber band flowing badge */}
        {flowingBadgePosition && (
          <div
            className="fixed z-50 pointer-events-none flex items-center justify-center"
            style={{
              left: flowingBadgePosition.x,
              top: flowingBadgePosition.y,
              width: flowingBadgePosition.width,
              height: flowingBadgePosition.height,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#916f2a] to-[#7a5d24] rounded-full shadow-lg flex items-center justify-center">
              <span className="text-white font-bold font-raleway-accent text-base">
                {navItems[instantActiveIndex !== null ? instantActiveIndex : navItems.findIndex(item => item.href === pathname)]?.name}
              </span>
            </div>
          </div>
        )}
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
          {/* Empty div for balance */}
          <div className="w-10 h-10"></div>

          {/* Logo - Centered with 3% left offset */}
          <Link href="/" className="flex items-center space-x-3 group absolute left-[47%] transform -translate-x-1/2">
            <div
              className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-brand-200 shadow-md"
            >
              <img 
                src="/advora-logo.jpg" 
                alt="Advora Services" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div>
                <span className="text-xl font-black font-raleway-heading group-hover:text-brand-600 transition-colors duration-300 uppercase" style={{ fontWeight: 800, color: '#424242' }}>Advora</span>
                <div className="my-0.5 h-px w-full" style={{ backgroundColor: '#916f2a' }}></div>
                <span className="text-sm font-raleway group-hover:text-brand-500 transition-colors duration-300 leading-none block text-center" style={{ color: '#424242' }}>Services</span>
              </div>
            </div>
          </Link>

          {/* Mobile Menu Toggle - Right Side */}
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