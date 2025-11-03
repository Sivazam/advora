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
      <Card className="h-full bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 border-0">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
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

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 mb-6 flex-1">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                </motion.div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onLearnMore}
              variant="outline"
              className="w-full border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white transition-all duration-300 group-hover:border-brand-700 hover:border-brand-600"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}