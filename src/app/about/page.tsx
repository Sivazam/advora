'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

import TopStrip from '@/components/TopStrip';
import SimpleHeroBanner from '@/components/SimpleHeroBanner';
import ImageHeroBanner from '@/components/ImageHeroBanner';
import ScrollToTop from '@/components/ScrollToTop';
import BreadcrumbOnly from '@/components/BreadcrumbOnly';
import ImageWithCenteredBreadcrumb from '@/components/ImageWithCenteredBreadcrumb';
import { 
  CheckCircle, 
  Users, 
  Award, 
  Target, 
  Eye, 
  Heart,
  TrendingUp,
  Globe,
  Building2,
  Star,
  Target as MissionIcon,
  Eye as VisionIcon
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      title: 'Integrity',
      description: 'We conduct our business with the highest ethical standards and transparency.',
      icon: Heart
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in every service we provide to our clients.',
      icon: Award
    },
    {
      title: 'Innovation',
      description: 'We embrace innovative solutions to meet the evolving needs of our clients.',
      icon: TrendingUp
    },
    {
      title: 'Client Focus',
      description: 'Our clients are at the center of everything we do.',
      icon: Users
    }
  ];

  const timeline = [
    {
      year: '2021',
      title: 'Founded',
      description: 'Advora Services LLP was established with a vision to provide exceptional tax and business services.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      year: '2022',
      title: 'USA Expansion',
      description: 'Expanded operations to serve clients in the United States.',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      year: '2023',
      title: 'Digital Transformation',
      description: 'Embraced digital solutions to enhance service delivery and client experience.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      year: '2024',
      title: 'Global Reach',
      description: 'Strengthened presence in both USA and Indian markets.',
      image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      year: '2025',
      title: 'Continued Growth',
      description: 'Continuing to expand services and client base with focus on innovation.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopStrip />
      <Navbar />
      
      <main>
        {/* Image with Centered Breadcrumb */}
        <ImageWithCenteredBreadcrumb
          breadcrumbItems={[
            { label: "About" }
          ]}
          imageUrl="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&h=1080&fit=crop&crop=center&q=80"
        />

        {/* Director Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
                  <div className="flex flex-col items-center text-center lg:text-left">
                    <motion.div
                      className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 overflow-hidden"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <img 
                        src="/advora-logo.jpg" 
                        alt="Advora Services LLP" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-luxury-heading">
                        Ramcharan Kotapati
                      </h2>
                      <p className="text-xl text-brand-600 dark:text-brand-400 font-medium mb-4 font-luxury-body">
                        Director & Founder
                      </p>
                      
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                        <span className="px-3 py-1 bg-[#916f2a] text-white rounded-full text-sm font-medium">
                          Tax Expert
                        </span>
                        <span className="px-3 py-1 bg-[#916f2a] text-white rounded-full text-sm font-medium">
                          Business Consultant
                        </span>
                        <span className="px-3 py-1 bg-[#916f2a] text-white rounded-full text-sm font-medium">
                          Strategic Advisor
                        </span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Leadership & Vision
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Ramcharan Kotapati brings over a decade of expertise in taxation and business services. 
                        His leadership has been instrumental in establishing Advora Services LLP as a trusted 
                        partner for businesses and individuals across the USA and India.
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        With a deep understanding of international tax laws and business regulations, 
                        Ramcharan has successfully guided numerous clients through complex tax situations 
                        and business challenges.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">15+ Years in Tax & Business Services</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Expert in US & Indian Tax Systems</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">1000+ Satisfied Clients</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Strategic Business Advisor</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#916f2a] rounded-xl flex items-center justify-center">
                        <MissionIcon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white font-luxury-heading">
                        Our Mission
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-luxury-body">
                      To provide exceptional tax and business services that empower our clients to achieve 
                      their financial goals. We are committed to delivering accurate, timely, and 
                      cost-effective solutions while maintaining the highest standards of integrity 
                      and professionalism.
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Client-Centric Approach</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Excellence in Service</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Innovation & Technology</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#916f2a] rounded-xl flex items-center justify-center">
                        <VisionIcon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white font-luxury-heading">
                        Our Vision
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-luxury-body">
                      To be the leading tax and business services provider recognized for our expertise, 
                      innovation, and unwavering commitment to client success. We aim to bridge the gap 
                      between complex tax regulations and business growth opportunities.
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Global Leadership</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Technological Innovation</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Sustainable Growth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-luxury-heading">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-luxury-body">
                The principles that guide our actions and decisions
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full text-center hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto mb-4 bg-[#916f2a] rounded-2xl flex items-center justify-center">
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Key milestones in our growth and development
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto">
              {/* Desktop Timeline */}
              <div className="hidden md:block relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-brand-600 to-brand-400"></div>
                
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative flex items-center mb-12`}
                  >
                    {/* Card and Date container */}
                    <div className="w-full flex items-center">
                      {/* Left side - Date for odd indices, Card for even indices */}
                      <div className="w-1/2 pr-8">
                        {index % 2 === 0 ? (
                          /* Even index - Card on left */
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-3 left-3">
                                <span className="text-2xl font-bold text-white">{item.year}</span>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          /* Odd index - Date on left */
                          <div className="text-right">
                            <motion.span
                              className="text-3xl font-bold text-brand-600 dark:text-brand-400 inline-block"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {item.year}
                            </motion.span>
                          </div>
                        )}
                      </div>
                      
                      {/* Timeline dot in center */}
                      <motion.div
                        className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-brand-600 rounded-full border-4 border-white dark:border-gray-800 z-10"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      
                      {/* Right side - Date for even indices, Card for odd indices */}
                      <div className="w-1/2 pl-8">
                        {index % 2 === 0 ? (
                          /* Even index - Date on right */
                          <div className="text-left">
                            <motion.span
                              className="text-3xl font-bold text-brand-600 dark:text-brand-400 inline-block"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {item.year}
                            </motion.span>
                          </div>
                        ) : (
                          /* Odd index - Card on right */
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-3 left-3">
                                <span className="text-2xl font-bold text-white">{item.year}</span>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden">
                <div className="relative">
                  {/* Vertical line for mobile */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-600 to-brand-400"></div>
                  
                  {timeline.map((item, index) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="relative mb-8"
                    >
                      {/* Timeline dot for mobile */}
                      <motion.div
                        className="absolute left-6 w-5 h-5 bg-brand-600 rounded-full border-4 border-white dark:border-gray-800 z-10"
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      
                      {/* Year badge for mobile */}
                      <div className="ml-16 mb-3">
                        <motion.span
                          className="inline-block px-3 py-1 bg-[#916f2a] text-white rounded-full text-sm font-bold"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {item.year}
                        </motion.span>
                      </div>
                      
                      {/* Card for mobile */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="ml-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <ScrollToTop />
    </div>
  );
}