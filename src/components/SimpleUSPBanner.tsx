'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const SimpleUSPBanner = () => {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundColor: '#f7f4c8' }}>
      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start justify-center">
            <Quote className="w-14 h-14 md:w-24 md:h-24 text-brand-600 flex-shrink-0 -mt-2 md:-mt-4" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal text-black leading-tight font-raleway">
              We will be readily available{" "}
              <span className="inline-block px-2 md:px-3 py-1 -ml-2 text-white font-semibold" style={{ backgroundColor: '#916f2a' }}>
                24/7 to our clients
              </span>
            </h1>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SimpleUSPBanner;