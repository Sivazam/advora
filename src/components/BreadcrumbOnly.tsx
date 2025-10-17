'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbOnlyProps {
  breadcrumbItems: { label: string; href?: string }[];
}

export default function BreadcrumbOnly({ breadcrumbItems }: BreadcrumbOnlyProps) {
  return (
    <div className="relative w-full bg-white border-b border-gray-200 py-4 -mt-14">
      <div className="container mx-auto px-4">
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center justify-center space-x-2 text-sm"
          aria-label="Breadcrumb"
        >
          <motion.a
            href="/"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
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
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {item.href ? (
                <motion.a
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.a>
              ) : (
                <span className="text-blue-600 font-medium">
                  {item.label}
                </span>
              )}
            </motion.div>
          ))}
        </motion.nav>
      </div>
    </div>
  );
}