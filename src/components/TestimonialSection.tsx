'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CEO",
    company: "TechStart Inc.",
    content: "Advora Services has been handling our business taxes for over 5 years. Their expertise in both US and Indian tax systems has saved us countless hours and significant money.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Rajesh Patel",
    role: "Software Engineer",
    company: "Google",
    content: "As an NRI working in the US, I was struggling with complex tax filings. Advora made the entire process seamless and stress-free. Highly recommended!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Small Business Owner",
    company: "Boutique Store",
    content: "The team at Advora helped me register my business and provides ongoing accounting services. Their attention to detail is exceptional.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Michael Rodriguez",
    role: "Director",
    company: "Global Corp",
    content: "Outstanding service and professional approach. The team is knowledgeable and always available to help with our international tax matters.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Entrepreneur",
    company: "Startup Hub",
    content: "Starting a business is challenging, but Advora made the tax and registration process incredibly smooth. Thank you for your excellent service!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "David Wilson",
    role: "CFO",
    company: "Finance Ltd",
    content: "Professional, reliable, and efficient. Advora has been our trusted tax partner for years. Their expertise is unmatched.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face"
  }
];

export default function TestimonialSection() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderTestimonialCard = (testimonial: Testimonial) => (
    <motion.div
      key={testimonial.id}
      className="h-full select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      style={{ height: '100%' }}
    >
      <Card className="h-full bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden group">
        <CardContent className="p-6 flex flex-col h-full">
          {/* Quote Icon */}
          <motion.div
            className="mb-4 text-brand-600"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Quote className="h-8 w-8" />
          </motion.div>

          {/* Rating */}
          <div className="flex mb-4">
            {renderStars(testimonial.rating)}
          </div>

          {/* Content */}
          <p className="mb-6 leading-relaxed flex-1 font-raleway select-none" style={{ color: '#424242' }}>
            "{testimonial.content}"
          </p>

          {/* Author Info */}
          <div className="mt-auto">
            <div>
              <h4 className="font-semibold font-raleway-heading select-none" style={{ color: '#424242' }}>
                {testimonial.name}
              </h4>
              <p className="text-sm font-raleway select-none" style={{ color: '#424242' }}>
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Create duplicated testimonials for infinite loop effect
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-20 pb-24 overflow-hidden w-full" style={{ backgroundColor: '#f7f4c8' }}>
      <div className="w-full max-w-full px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-raleway-heading" style={{ color: '#424242' }}>
            What Our
            <span className="gradient-brand-text">
              {' '}Clients Say
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto font-raleway" style={{ color: '#424242' }}>
            Don't just take our word for it - hear from our satisfied clients
          </p>
        </motion.div>

        {/* Swiper Carousel - Full width */}
        <div className="relative mb-16" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={32}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 24
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 32
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 32
              }
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            loop={true}
            loopAdditionalSlides={4}
            allowTouchMove={true}
            grabCursor={true}
            simulateTouch={true}
            touchEventsTarget="container"
            resistance={true}
            resistanceRatio={0.85}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3
            }}
            speed={600}
            effect="slide"
            className="testimonial-swiper"
            style={{
              padding: '1rem 0',
              overflow: 'visible'
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <SwiperSlide key={`${testimonial.id}-${index}`} style={{ height: 'auto' }}>
                {renderTestimonialCard(testimonial)}
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Navigation Buttons - REMOVED */}
          {/* Navigation arrows removed as requested */}
          
          {/* Mobile Swipe Hint - REMOVED */}
          {/* Swipe hint text removed as requested */}
        </div>

        {/* Additional Stats */}
        <motion.div
          className="flex justify-center items-center w-full mt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-8 bg-white px-8 py-4 rounded-full shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">98%</div>
              <div className="text-sm" style={{ color: '#424242' }}>Client Satisfaction</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">24/7</div>
              <div className="text-sm" style={{ color: '#424242' }}>Support Available</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">5+</div>
              <div className="text-sm" style={{ color: '#424242' }}>Years Experience</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .testimonial-swiper {
          padding: 1rem 4rem !important;
        }
        
        .testimonial-swiper .swiper-slide {
          height: auto !important;
        }
        
        .testimonial-swiper .swiper-pagination {
          bottom: -2rem !important;
        }
        
        .testimonial-swiper .swiper-pagination-bullet {
          background: #424242 !important;
          opacity: 0.3 !important;
        }
        
        .testimonial-swiper .swiper-pagination-bullet-active {
          background: #424242 !important;
          opacity: 1 !important;
        }
        
        .testimonial-swiper .swiper-button-prev,
        .testimonial-swiper .swiper-button-next {
          display: none !important;
        }
        
        /* Hide scrollbar */
        .testimonial-swiper::-webkit-scrollbar {
          display: none;
        }
        
        .testimonial-swiper {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (max-width: 768px) {
          .testimonial-swiper {
            padding: 1rem 1rem !important;
          }
        }
      `}</style>
    </section>
  );
}