'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Briefcase, 
  Info, 
  Phone, 
  HelpCircle
} from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Services', href: '/services', icon: Briefcase },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Phone },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
];

export default function MobileNavbar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ 
                    scale: 1.08,
                    y: -3,
                    transition: { 
                      duration: 0.3, 
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 400,
                      damping: 20
                    }
                  }}
                  whileTap={{ 
                    scale: 0.94,
                    transition: { duration: 0.12, ease: "easeIn" }
                  }}
                >
                  <motion.div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    whileHover={{ 
                      y: -4,
                      scale: 1.1,
                      transition: { 
                        duration: 0.4, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 350,
                        damping: 25
                      }
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  </motion.div>
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                  
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      layoutId="mobile-nav-indicator"
                      initial={false}
                      transition={{ 
                        type: "spring",
                        stiffness: 180,
                        damping: 28,
                        mass: 1.8,
                        restDelta: 0.001
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}