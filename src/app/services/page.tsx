'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRouter } from 'next/navigation';

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
  Star,
  Receipt,
  Briefcase,
  Rocket,
  DollarSign,
  PiggyBank,
  ChartPie,
  Target
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
      image: 'https://plus.unsplash.com/premium_photo-1679784204532-b816d1b26ab2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHRheHxlbnwwfHwwfHx8MA%3D%3D?w=600&h=400&fit=crop&crop=center'
    },
    {
      title: 'Business Tax Returns',
      description: 'Expert business tax preparation for all entity types',
      forms: ['1120 (Corporations)', '1120S (S-Corp)', '1065 (Partnership)', 'Schedule-C (SMLLC)', 'Trusts'],
      features: ['Multi-state Filing', 'Deduction Optimization', 'Compliance Review', 'Strategic Tax Planning'],
      image: 'https://plus.unsplash.com/premium_photo-1679496828825-5d479da38e07?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJ1c2luZXNzJTIwdGF4fGVufDB8fDB8fHww?w=600&h=400&fit=crop&crop=center'
    }
  ];

  const businessServices = [
    {
      title: 'Business Registrations',
      description: 'Complete business formation and registration services',
      icon: Building2,
      services: ['Company Formation', 'LLC Registration', 'Partnership Setup', 'Sole Proprietorship', 'Non-profit Registration'],
      image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFwZXIlMjB3b3JrfGVufDB8fDB8fHww?w=600&h=400&fit=crop&crop=center'
    },
    {
      title: 'Bookkeeping & Accounting',
      description: 'Professional accounting and bookkeeping solutions',
      icon: BookOpen,
      services: ['Maintaining Books of Accounts', 'Financial Statement Preparation', 'Accounts Payable/Receivable', 'Bank Reconciliation', 'Financial Reporting'],
      image: 'https://images.unsplash.com/photo-1707157284454-553ef0a4ed0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFjY291bnRpbmd8ZW58MHx8MHx8fDA%3D?w=600&h=400&fit=crop&crop=center'
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
      image: 'https://images.unsplash.com/photo-1676312210846-104b89aafd81?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fGxlZ2FsfGVufDB8fDB8fHwy?w=600&h=400&fit=crop&crop=center'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f4c8' }}>
      {/* <TopStrip /> */}
      
      <main>
        {/* Image with Centered Breadcrumb */}
        <ImageWithCenteredBreadcrumb
          breadcrumbItems={[
            { label: "Services" }
          ]}
          imageUrl="https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRheCUyMHNlcnZpY2VzfGVufDB8fDB8fHww?w=1920&h=1080&fit=crop&crop=center&q=80"
        />

        {/* Services Content */}
        <section className="py-20" style={{ backgroundColor: '#f7f4c8' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Tax Filing Services */}
              <Collapsible open={openSections.taxFiling} onOpenChange={() => toggleSection('taxFiling')}>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-2xl font-luxury-heading" style={{ color: '#424242' }}>
                              Tax Filing Services
                            </CardTitle>
                            <CardDescription className="font-luxury-body" style={{ color: '#424242' }}>
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
                                <h3 className="text-lg font-semibold font-luxury-heading" style={{ color: '#424242' }}>
                                  {service.title}
                                </h3>
                              </div>
                              
                              <p className="mb-4 text-sm font-luxury-body" style={{ color: '#424242' }}>
                                {service.description}
                              </p>
                              
                              <div className="mb-4">
                                <h4 className="font-medium mb-2 text-sm" style={{ color: '#424242' }}>Tax Forms:</h4>
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
                                <h4 className="font-medium mb-2 text-sm" style={{ color: '#424242' }}>Features:</h4>
                                <ul className="space-y-1">
                                  {service.features.map((feature, idx) => (
                                    <motion.li 
                                      key={idx} 
                                      className="flex items-center space-x-2 text-xs font-luxury-body"
                                      style={{ color: '#424242' }}
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
                          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
                            <Rocket className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-2xl font-luxury-heading" style={{ color: '#424242' }}>
                              Business Services
                            </CardTitle>
                            <CardDescription className="font-luxury-body" style={{ color: '#424242' }}>
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
                                <h3 className="text-lg font-semibold font-luxury-heading" style={{ color: '#424242' }}>
                                  {service.title}
                                </h3>
                              </div>
                              
                              <p className="mb-4 text-sm font-luxury-body" style={{ color: '#424242' }}>
                                {service.description}
                              </p>
                              
                              <div className="mt-auto">
                                <h4 className="font-medium mb-2 text-sm" style={{ color: '#424242' }}>Services Include:</h4>
                                <ul className="space-y-1">
                                  {service.services.map((item, idx) => (
                                    <motion.li 
                                      key={idx} 
                                      className="flex items-center space-x-2 text-xs font-luxury-body"
                                      style={{ color: '#424242' }}
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
                  <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
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