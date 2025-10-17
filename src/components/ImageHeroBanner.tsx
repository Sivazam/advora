'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface ImageHeroBannerProps {
  title: string;
  breadcrumbItems?: { label: string; href?: string }[];
  imageUrl?: string;
  height?: 'small' | 'medium' | 'large';
}

export default function ImageHeroBanner({
  title,
  breadcrumbItems = [],
  imageUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd8c?w=1920&h=1080&fit=crop&crop=center',
  height = 'large'
}: ImageHeroBannerProps) {
  const heightClasses = {
    small: 'h-[50vh]',
    medium: 'h-[55vh]',
    large: 'h-[60vh]'
  };

  return (
    <div className={`relative w-full overflow-hidden ${heightClasses[height]} -mt-14`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
        }}
      />
      
      {/* Black Tint Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      
      {/* Content - Centered with top padding */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center pt-[80px] pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center text-white"
          >
            {/* Title */}
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight font-luxury-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              {title}
            </motion.h1>

            {/* Breadcrumb */}
            {breadcrumbItems.length > 0 && (
              <motion.nav
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-center space-x-2 text-sm"
                aria-label="Breadcrumb"
              >
                <motion.a
                  href="/"
                  className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
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
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    {item.href ? (
                      <motion.a
                        href={item.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.label}
                      </motion.a>
                    ) : (
                      <span className="text-white font-medium">
                        {item.label}
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.nav>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}