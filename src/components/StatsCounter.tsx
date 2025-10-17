'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface StatItem {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
}

interface StatsCounterProps {
  stats: StatItem[];
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  const [counters, setCounters] = useState(stats.map(() => 0));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => 
        prev.map((current, index) => {
          const target = stats[index].value;
          const increment = target / steps;
          return Math.min(current + increment, target);
        })
      );
    }, interval);

    setTimeout(() => {
      clearInterval(timer);
      setCounters(stats.map(stat => stat.value));
    }, duration);

    return () => clearInterval(timer);
  }, [isInView, stats]);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <motion.div
            className="text-4xl md:text-5xl font-bold text-blue-600 mb-2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2, type: "spring" }}
            viewport={{ once: true }}
          >
            {stat.prefix}{Math.floor(counters[index])}{stat.suffix}
          </motion.div>
          
          <motion.p
            className="text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.3 }}
            viewport={{ once: true }}
          >
            {stat.label}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}