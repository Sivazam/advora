'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

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
    content: "Advora Services LLP has been handling our business taxes for over 5 years. Their expertise in both US and Indian tax systems has saved us countless hours and significant money.",
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
  const [isPaused, setIsPaused] = useState(false);
  
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

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <motion.div
      key={`${testimonial.id}-${index}`}
      className="flex-shrink-0 w-80 mx-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
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
          <p className="text-gray-600 mb-6 leading-relaxed flex-1 font-raleway">
            "{testimonial.content}"
          </p>

          {/* Author Info */}
          <div className="flex items-center space-x-4 mt-auto">
            <motion.img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
            <div>
              <h4 className="font-semibold text-gray-900 font-raleway-heading">
                {testimonial.name}
              </h4>
              <p className="text-sm text-gray-600 font-raleway">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section className="py-20 bg-gradient-to-br from-brand-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-raleway-heading">
            What Our
            <span className="gradient-brand-text">
              {' '}Clients Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-raleway">>
            Don't just take our word for it - hear from our satisfied clients
          </p>
        </motion.div>

        {/* Scrolling Testimonials */}
        <div 
          className="relative mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Single Row - Left to Right */}
          <motion.div
            className="flex"
            animate={{
              x: isPaused ? 0 : [-2000, 2000]
            }}
            transition={{
              duration: 60, // Very slow speed for reading
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {testimonials.map((testimonial, index) => renderTestimonialCard(testimonial, index))}
            {/* Duplicate for seamless loop */}
            {testimonials.map((testimonial, index) => renderTestimonialCard(testimonial, index + testimonials.length))}
          </motion.div>
        </div>

        {/* Additional Stats */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-8 bg-white px-8 py-4 rounded-full shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">98%</div>
              <div className="text-sm text-gray-600">Client Satisfaction</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">15+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}