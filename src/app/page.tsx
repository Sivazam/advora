'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';
import ScrollToTop from '@/components/ScrollToTop';
import HeroCarousel from '@/components/HeroCarousel';
import ServiceCard from '@/components/ServiceCard';
import StatsCounter from '@/components/StatsCounter';
import TestimonialSection from '@/components/TestimonialSection';
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  FileText, 
  Building2, 
  TrendingUp,
  Award,
  Globe,
  Star,
  BarChart3,
  Shield,
  Target
} from 'lucide-react';

export default function Home() {

  const services = [
    {
      title: 'Tax Filing Services',
      description: 'Professional tax filing for individuals and businesses with maximum accuracy and compliance.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd8c?w=600&h=400&fit=crop&crop=center',
      features: ['Individual Tax Returns', 'Business Tax Returns', 'International Tax Services']
    },
    {
      title: 'Business Registrations',
      description: 'Complete business registration services with expert guidance and documentation.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&crop=center',
      features: ['Company Formation', 'LLC Registration', 'Partnership Setup']
    },
    {
      title: 'Accounting Services',
      description: 'Comprehensive bookkeeping and accounting solutions for your business needs.',
      image: 'https://images.unsplash.com/photo-1554224155-26072cf3008e?w=600&h=400&fit=crop&crop=center',
      features: ['Bookkeeping', 'Financial Statements', 'Payroll Services']
    },
    {
      title: 'Legal Representation',
      description: 'Expert legal representation for tax matters and business compliance.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c71ca85?w=600&h=400&fit=crop&crop=center',
      features: ['Tax Disputes', 'Legal Compliance', 'Business Advisory']
    }
  ];

  const stats = [
    {
      value: 1500,
      label: 'Happy Clients',
      suffix: '+',
      icon: <Users className="h-12 w-12 text-blue-600" />
    },
    {
      value: 15,
      label: 'Years Experience',
      suffix: '+',
      icon: <Award className="h-12 w-12 text-blue-600" />
    },
    {
      value: 2,
      label: 'Countries',
      suffix: '',
      icon: <Globe className="h-12 w-12 text-blue-600" />
    },
    {
      value: 99,
      label: 'Success Rate',
      suffix: '%',
      icon: <Target className="h-12 w-12 text-blue-600" />
    }
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Confidential',
      description: 'Your financial information is protected with the highest security standards.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Expert Analysis',
      description: 'Get detailed insights and analysis for better financial decisions.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Certified Professionals',
      description: 'Our team consists of certified tax professionals and legal experts.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <TopStrip />
        <Navbar />
        
        <main className="pb-16 md:pb-0">
          {/* Hero Carousel */}
          <HeroCarousel />

          {/* Stats Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <StatsCounter stats={stats} />
            </div>
          </section>

          {/* Services Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                  Our
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                    {' '}Services
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Comprehensive tax and business solutions tailored to your needs
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.title}
                    title={service.title}
                    description={service.description}
                    image={service.image}
                    features={service.features}
                    index={index}
                    onLearnMore={() => console.log('Learn more about', service.title)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                  Why Choose
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                    {' '}Advora
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  We combine expertise, technology, and personalized service
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 40, rotateY: 15 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="group h-full"
                    whileHover={{ 
                      y: -10,
                      scale: 1.02,
                      transition: { duration: 0.3, ease: 'easeOut' }
                    }}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 h-full flex flex-col">
                      <div className="relative h-48 flex-shrink-0">
                        <motion.img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <motion.div
                          className="absolute top-4 left-4 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: 10,
                            transition: { duration: 0.4, ease: 'easeOut' }
                          }}
                        >
                          {feature.icon}
                        </motion.div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 flex-1 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <TestimonialSection />

          {/* Director Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                  Meet Our
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                    {' '}Director
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Leadership with vision and expertise
                </p>
              </motion.div>
              
              <motion.div
                className="max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
                    <motion.div
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, x: -60, rotateY: -20 }}
                      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 shadow-2xl overflow-hidden"
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 10,
                          transition: { duration: 0.6, ease: 'easeOut' }
                        }}
                        animate={{ 
                          y: [0, -5, 0],
                        }}
                        transition={{ 
                          duration: 4,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatType: 'reverse'
                        }}
                      >
                        <img 
                          src="/advora-logo.jpg" 
                          alt="Advora Services LLP" 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                          Ramcharan Kotapati
                        </h3>
                        <p className="text-xl text-blue-600 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Director & Founder
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                          <motion.span 
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-50 text-blue-700"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            whileHover={{ 
                              scale: 1.05,
                              y: -2,
                              transition: { duration: 0.2, ease: 'easeOut' }
                            }}
                          >
                            Tax Expert
                          </motion.span>
                          <motion.span 
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-700"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            whileHover={{ 
                              scale: 1.05,
                              y: -2,
                              transition: { duration: 0.2, ease: 'easeOut' }
                            }}
                          >
                            Business Consultant
                          </motion.span>
                          <motion.span 
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-purple-100 text-purple-700"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            whileHover={{ 
                              scale: 1.05,
                              y: -2,
                              transition: { duration: 0.2, ease: 'easeOut' }
                            }}
                          >
                            Strategic Advisor
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0, x: 60, rotateY: 20 }}
                      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                      transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    >
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                          Vision & Leadership
                        </h4>
                        <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Ramcharan Kotapati brings over a decade of expertise in taxation and business services. 
                          His leadership has been instrumental in establishing Advora Services LLP as a trusted 
                          partner for businesses and individuals across the USA and India.
                        </p>
                        <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                          With a deep understanding of both US and Indian tax systems, Ramcharan has successfully 
                          guided numerous clients through complex tax matters, business registrations, and 
                          compliance requirements. His commitment to excellence and client satisfaction has 
                          made Advora Services LLP a preferred choice for tax and business services.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>Expertise</h5>
                            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Over 15 years of experience in taxation and business consulting
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>Global Perspective</h5>
                            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Extensive knowledge of US and Indian tax systems and regulations
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>Client Success</h5>
                            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Successfully served 1500+ clients with 99% success rate
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Let us help you navigate your tax and business needs with expert guidance and personalized service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg">
                      Get Started Today
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-8 py-3 rounded-lg">
                      Contact Us
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}