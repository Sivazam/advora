'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

import TopStrip from '@/components/TopStrip';
import SimpleHeroBanner from '@/components/SimpleHeroBanner';
import ImageHeroBanner from '@/components/ImageHeroBanner';
import ScrollToTop from '@/components/ScrollToTop';
import BreadcrumbOnly from '@/components/BreadcrumbOnly';
import ImageWithCenteredBreadcrumb from '@/components/ImageWithCenteredBreadcrumb';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Building2, 
  Users, 
  Calculator,
  Scale,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    taxFiling: true,
    businessServices: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const taxFilingServices = [
    {
      title: 'Individual Tax Returns',
      description: 'Comprehensive individual tax filing services for US and Indian residents',
      forms: ['1040', '1040-NR'],
      features: ['Federal & State Returns', 'Maximum Refund Guarantee', 'Audit Support', 'Year-round Assistance'],
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd14?w=600&h=400&fit=crop&crop=center'
    },
    {
      title: 'Business Tax Returns',
      description: 'Expert business tax preparation for all entity types',
      forms: ['1120 (Corporations)', '1120S (S-Corp)', '1065 (Partnership)', 'Schedule-C (SMLLC)', 'Trusts'],
      features: ['Multi-state Filing', 'Deduction Optimization', 'Compliance Review', 'Strategic Tax Planning'],
      image: 'https://images.unsplash.com/photo-1560523159-6b8e8c1a6e2e?w=600&h=400&fit=crop&crop=center'
    }
  ];

  const businessServices = [
    {
      title: 'Business Registrations',
      description: 'Complete business formation and registration services',
      icon: Building2,
      services: ['Company Formation', 'LLC Registration', 'Partnership Setup', 'Sole Proprietorship', 'Non-profit Registration'],
      image: 'https://images.unsplash.com/photo-1560523159-6b8e8c1a6e2e?w=600&h=400&fit=crop&crop=center'
    },
    {
      title: 'Bookkeeping & Accounting',
      description: 'Professional accounting and bookkeeping solutions',
      icon: BookOpen,
      services: ['Maintaining Books of Accounts', 'Financial Statement Preparation', 'Accounts Payable/Receivable', 'Bank Reconciliation', 'Financial Reporting'],
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center'
    },
    {
      title: 'Payroll Services',
      description: 'Comprehensive payroll processing and compliance',
      icon: Calculator,
      services: ['Payroll Processing', 'Tax Withholding', 'Direct Deposit', 'Payroll Tax Returns', 'Year-end W-2/1099'],
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop&crop=center'
    },
    {
      title: 'Legal Representation',
      description: 'Expert legal services for tax and business matters',
      icon: Scale,
      services: ['Tax Dispute Resolution', 'IRS Representation', 'Business Compliance', 'Contract Review', 'Legal Advisory'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center'
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
            { label: "Services" }
          ]}
          imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop&crop=center&q=80"
        />

        {/* Services Content */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Tax Filing Services */}
              <Collapsible open={openSections.taxFiling} onOpenChange={() => toggleSection('taxFiling')}>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden">
                            <img 
                              src="/advora-logo.jpg" 
                              alt="Advora Services LLP" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-2xl text-gray-900 dark:text-white">
                              Tax Filing Services
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              Professional tax preparation for individuals and businesses
                            </CardDescription>
                          </div>
                        </div>
                        {openSections.taxFiling ? (
                          <ChevronUp className="h-6 w-6 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                        {taxFilingServices.map((service, index) => (
                          <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col"
                          >
                            <div className="relative h-40 overflow-hidden">
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-3 left-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                  <Star className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                              <div className="flex items-center space-x-3 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-luxury-heading">
                                  {service.title}
                                </h3>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm font-luxury-body">
                                {service.description}
                              </p>
                              
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Tax Forms:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {service.forms.map((form) => (
                                    <motion.span
                                      key={form}
                                      className="px-3 py-1 bg-brand-600 text-white rounded-full text-xs font-medium"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {form}
                                    </motion.span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-auto">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Features:</h4>
                                <ul className="space-y-1">
                                  {service.features.map((feature, idx) => (
                                    <motion.li 
                                      key={idx} 
                                      className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 font-luxury-body"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    >
                                      <CheckCircle className="h-3 w-3 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Business Services */}
              <Collapsible open={openSections.businessServices} onOpenChange={() => toggleSection('businessServices')}>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden">
                            <img 
                              src="/advora-logo.jpg" 
                              alt="Advora Services LLP" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-2xl text-gray-900 dark:text-white">
                              Business Services
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              Comprehensive business solutions for growth and compliance
                            </CardDescription>
                          </div>
                        </div>
                        {openSections.businessServices ? (
                          <ChevronUp className="h-6 w-6 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                        {businessServices.map((service, index) => (
                          <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col"
                          >
                            <div className="relative h-40 overflow-hidden">
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-3 left-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                  <service.icon className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                              <div className="flex items-center space-x-3 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-luxury-heading">
                                  {service.title}
                                </h3>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm font-luxury-body">
                                {service.description}
                              </p>
                              
                              <div className="mt-auto">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Services Include:</h4>
                                <ul className="space-y-1">
                                  {service.services.map((item, idx) => (
                                    <motion.li 
                                      key={idx} 
                                      className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 font-luxury-body"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    >
                                      <CheckCircle className="h-3 w-3 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                                      <span>{item}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                              
                              <motion.div
                                className="mt-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white transition-all duration-300"
                                >
                                  Learn More
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <Card className="gradient-brand text-white border-0">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                  <p className="text-white mb-6 max-w-2xl mx-auto">
                    Let our expert team help you with your tax and business needs. 
                    Contact us today for a consultation.
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-brand-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold"
                    onClick={() => router.push('/contact')}
                  >
                    Contact Us Today
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      
      <ScrollToTop />
    </div>
  );
}