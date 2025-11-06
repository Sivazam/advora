'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

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
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd14?w=1920&h=800&fit=crop&crop=top&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Learn More',
    ctaLink: '/services'
  },
  {
    id: 2,
    title: 'Business Registration Solutions',
    description: 'Complete business formation and registration services with expert guidance. Start your business journey with confidence.',
    image: 'https://images.unsplash.com/photo-1560523159-6b8e8c1a6e2e?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Get Started',
    ctaLink: '/services'
  },
  {
    id: 3,
    title: 'International Tax Expertise',
    description: 'Specialized tax services for US-India cross-border taxation. Navigate complex international tax laws with ease.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Explore Services',
    ctaLink: '/services'
  },
  {
    id: 4,
    title: 'Comprehensive Accounting',
    description: 'Full-service accounting and bookkeeping solutions for your business. Focus on growth while we handle the numbers.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Contact Us',
    ctaLink: '/contact'
  },
  {
    id: 5,
    title: 'Legal Tax Representation',
    description: 'Expert legal representation for tax disputes and compliance matters with proven track record.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=800&fit=crop&crop=center&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1560523159-6b8e8c1a6e2e?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'Get Help',
    ctaLink: '/contact'
  },
  {
    id: 6,
    title: 'Payroll Processing Services',
    description: 'Efficient and accurate payroll processing with tax compliance and timely reporting.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1920&h=800&fit=crop&crop=top&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=800&fit=crop&crop=center&q=80',
    ctaText: 'View Details',
    ctaLink: '/services'
  }
];

export default function HeroCarousel() {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleImageError = (slideId: number) => {
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
  };

  const handleImageLoad = (slideId: number) => {
    setImageLoaded(prev => ({ ...prev, [slideId]: true }));
  };

  const scrollToNext = () => {
    const nextSection = document.querySelector('#stats-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Preload only current and next images for better performance
    const currentSlide = heroSlides[0];
    const nextSlide = heroSlides[1];
    [currentSlide, nextSlide].forEach(slide => {
      const img = new Image();
      img.onload = () => handleImageLoad(slide.id);
      img.onerror = () => handleImageError(slide.id);
      img.src = slide.image;
    });
  }, []);

  return (
    <div 
      id="hero-carousel"
      className="relative w-full h-screen overflow-hidden"
    >
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        loop={true}
        allowTouchMove={true}
        grabCursor={true}
        simulateTouch={true}
        resistance={true}
        resistanceRatio={0.85}
        speed={800}
        effect="fade"
        fadeEffect={{
          crossFade: false
        }}
        onSlideChange={(swiper) => setCurrentSlideIndex(swiper.realIndex)}
        pagination={{
          clickable: true,
          el: '.custom-pagination',
          bulletClass: 'custom-dot',
          bulletActiveClass: 'custom-dot-active',
          renderBullet: (index, className) => {
            return `<button class="${className}" aria-label="Go to slide ${index + 1}"></button>`;
          }
        }}
        className="hero-swiper h-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="h-full">
            <div className="relative w-full h-full">
              {/* Background Image */}
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
                onLoad={() => handleImageLoad(slide.id)}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center" style={{ paddingTop: '10vh' }}>
                <div className="container mx-auto px-4">
                  <div className="max-w-6xl text-center mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                      className="text-white"
                    >
                      <motion.h1 
                        className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-luxury-heading"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                      >
                        {slide.title}
                      </motion.h1>
                      
                      <motion.p 
                        className="text-lg md:text-xl text-gray-200 mb-8 mx-auto leading-relaxed font-luxury-body max-w-3xl"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                      >
                        {slide.description}
                      </motion.p>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
                          onClick={() => router.push(slide.ctaLink)}
                        >
                          <span>{slide.ctaText}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
        key={currentSlideIndex}
      />

      {/* Custom Navigation Dots */}
      <div className="custom-pagination absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20"></div>

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

      {/* Custom Styles for Navigation Dots */}
      <style jsx>{`
        .hero-swiper {
          width: 100%;
          height: 100%;
        }
        
        .hero-swiper .swiper-slide {
          height: 100vh;
        }
        
        .custom-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          padding: 0;
        }
        
        .custom-dot:hover {
          background-color: rgba(255, 255, 255, 0.75);
        }
        
        .custom-dot-active {
          width: 32px;
          background-color: white;
          border-radius: 4px;
        }
        
        /* Hide default Swiper pagination */
        .hero-swiper .swiper-pagination {
          display: none;
        }
        
        /* Fade effect specific styles */
        .hero-swiper .swiper-fade .swiper-slide {
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }
        
        .hero-swiper .swiper-fade .swiper-slide-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}