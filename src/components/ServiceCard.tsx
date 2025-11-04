'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  features: string[];
  index: number;
  onLearnMore?: () => void;
}

export default function ServiceCard({ 
  title, 
  description, 
  image, 
  features, 
  index, 
  onLearnMore 
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 border-0 rounded-2xl bg-white flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl flex-shrink-0">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <motion.div
            className="absolute bottom-4 left-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold">{title}</h3>
          </motion.div>
        </div>

        <div className="pt-6 pb-4 px-6">
          <p className="text-base leading-relaxed" style={{ color: '#424242' }}>
            {description}
          </p>
        </div>

        <div className="flex-1 flex flex-col px-6 py-6">
          <div className="space-y-3 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div>
                  <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                </div>
                <span className="text-sm" style={{ color: '#424242' }}>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onLearnMore}
                className="w-full transition-all duration-300 group-hover:scale-105"
                style={{ backgroundColor: '#916f2a', color: 'white', border: 'none' }}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" style={{ color: 'white' }} />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}