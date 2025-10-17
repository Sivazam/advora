'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  breadcrumbItems?: { label: string; href?: string }[];
  height?: 'small' | 'medium' | 'large';
  overlay?: 'light' | 'medium' | 'dark';
}

export default function HeroBanner({
  title,
  subtitle,
  backgroundImage,
  breadcrumbItems = [],
  height = 'medium',
  overlay = 'medium'
}: HeroBannerProps) {
  const heightClasses = {
    small: 'h-[30vh]',
    medium: 'h-[40vh]',
    large: 'h-[50vh]'
  };

  const overlayClasses = {
    light: 'bg-black/30',
    medium: 'bg-black/50',
    dark: 'bg-black/70'
  };

  return (
    <div className={`relative w-full overflow-hidden ${heightClasses[height]} -mt-14`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-white"
          >
            {/* Breadcrumb */}
            {breadcrumbItems.length > 0 && (
              <motion.nav
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="flex items-center space-x-2 text-sm mb-4"
                aria-label="Breadcrumb"
              >
                <motion.a
                  href="/"
                  className="flex items-center text-blue-200 hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </motion.a>
                
                {breadcrumbItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <ChevronRight className="h-4 w-4 text-blue-200" />
                    {item.href ? (
                      <motion.a
                        href={item.href}
                        className="text-blue-200 hover:text-white transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.label}
                      </motion.a>
                    ) : (
                      <span className="text-white font-medium">{item.label}</span>
                    )}
                  </motion.div>
                ))}
              </motion.nav>
            )}

            {/* Title */}
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight font-luxury-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed font-luxury-body"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}