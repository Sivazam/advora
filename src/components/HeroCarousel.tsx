'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  fallbackImage: string;
  ctaText: string;
  ctaLink: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Expert Tax Filing Services',
    description: 'Professional tax preparation for individuals and businesses with maximum accuracy and compliance. Serving both USA and India.',
    image: 'https://images.unsplash.com/photo-1554224154-2607263b7a2f?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd14?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Learn More',
    ctaLink: '/services'
  },
  {
    id: 2,
    title: 'Business Registration Solutions',
    description: 'Complete business formation and registration services with expert guidance. Start your business journey with confidence.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Get Started',
    ctaLink: '/services'
  },
  {
    id: 3,
    title: 'International Tax Expertise',
    description: 'Specialized tax services for US-India cross-border taxation. Navigate complex international tax laws with ease.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c71ca85?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Explore Services',
    ctaLink: '/services'
  },
  {
    id: 4,
    title: 'Comprehensive Accounting',
    description: 'Full-service accounting and bookkeeping solutions for your business. Focus on growth while we handle the numbers.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd8c?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Contact Us',
    ctaLink: '/contact'
  },
  {
    id: 5,
    title: 'Legal Tax Representation',
    description: 'Expert legal representation for tax disputes and compliance matters with proven track record.',
    image: 'https://images.unsplash.com/photo-1589829545866-10a7ed019b38?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1560523159-6b8e8c1a6e2e?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Get Help',
    ctaLink: '/contact'
  },
  {
    id: 6,
    title: 'Payroll Processing Services',
    description: 'Efficient and accurate payroll processing with tax compliance and timely reporting.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'View Details',
    ctaLink: '/services'
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleImageError = (slideId: number) => {
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
  };

  const handleImageLoad = (slideId: number) => {
    setImageLoaded(prev => ({ ...prev, [slideId]: true }));
  };

  useEffect(() => {
    // Preload images
    heroSlides.forEach(slide => {
      const img = new Image();
      img.onload = () => handleImageLoad(slide.id);
      img.onerror = () => handleImageError(slide.id);
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const scrollToNext = () => {
    const nextSection = document.querySelector('#stats-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      id="hero-carousel"
      className="relative w-full h-[100vh] overflow-hidden -mt-14"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0 
            }}
            transition={{ 
              duration: 1.5, 
              ease: 'easeInOut' 
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${imageErrors[slide.id] ? slide.fallbackImage : slide.image})` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
            </div>
            {/* Hidden image for error handling */}
            <img 
              src={slide.image}
              alt=""
              className="hidden"
              onError={() => handleImageError(slide.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center pt-[140px] pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl text-center mx-auto">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              className="text-white"
            >
              <motion.h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-luxury-heading"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-200 mb-8 mx-auto leading-relaxed font-luxury-body"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              >
                {heroSlides[currentSlide].description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <span>{heroSlides[currentSlide].ctaText}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {heroSlides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-brand-600 z-20"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: 'linear',
          repeatDelay: 0.1
        }}
        key={currentSlide}
      />

      {/* Scroll Animation Icon */}
      <motion.button
        onClick={scrollToNext}
        className="absolute bottom-8 right-8 z-20 text-white hover:text-brand-300 transition-colors"
        animate={{ 
          y: [0, 10, 0],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </div>
  );
}