'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';
import SimpleHeroBanner from '@/components/SimpleHeroBanner';
import ImageHeroBanner from '@/components/ImageHeroBanner';
import ScrollToTop from '@/components/ScrollToTop';
import BreadcrumbOnly from '@/components/BreadcrumbOnly';
import ImageWithCenteredBreadcrumb from '@/components/ImageWithCenteredBreadcrumb';
import { 
  ChevronDown, 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone,
  Mail,
  CheckCircle,
  Star,
  FileText,
  Users,
  Globe,
  Building2
} from 'lucide-react';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqCategories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'tax', name: 'Tax Services', icon: FileText },
    { id: 'business', name: 'Business Services', icon: Building2 },
    { id: 'general', name: 'General', icon: Globe },
    { id: 'contact', name: 'Contact', icon: Users }
  ];

  const faqData = [
    {
      id: 'q1',
      category: 'tax',
      question: 'Which tax forms do you handle?',
      answer: 'We handle a comprehensive range of tax forms including Individual (1040, 1040-NR), Business (1120, 1120S, 1065, Schedule-C, Trusts), and various state-specific tax forms. Our experts are proficient in both US and Indian tax systems.',
      icon: FileText
    },
    {
      id: 'q2',
      category: 'general',
      question: 'Do you provide services in both USA & India?',
      answer: 'Yes, we proudly serve clients in both the USA and India. We have offices in Irving, Texas, and Hyderabad, India, with teams familiar with the tax laws and business regulations of both countries.',
      icon: Globe
    },
    {
      id: 'q3',
      category: 'general',
      question: 'How do I get started with your services?',
      answer: 'Getting started is easy! You can contact us through our website, call our offices, or email us directly. We\'ll schedule a consultation to understand your needs and provide you with a customized service plan.',
      icon: HelpCircle
    },
    {
      id: 'q4',
      category: 'tax',
      question: 'What is your turnaround time for tax filing?',
      answer: 'Our turnaround time varies depending on the complexity of your tax situation. For individual returns, we typically complete within 3-5 business days. For business returns, it may take 7-14 business days. We also offer expedited services for urgent filings.',
      icon: FileText
    },
    {
      id: 'q5',
      category: 'business',
      question: 'What business registration services do you offer?',
      answer: 'We offer comprehensive business registration services including Company Formation, LLC Registration, Partnership Setup, Sole Proprietorship registration, and Non-profit organization setup. We handle all the paperwork and ensure compliance with local regulations.',
      icon: Building2
    },
    {
      id: 'q6',
      category: 'business',
      question: 'Do you provide ongoing accounting services?',
      answer: 'Yes, we provide complete accounting and bookkeeping services including maintaining books of accounts, financial statement preparation, accounts payable/receivable management, bank reconciliation, and regular financial reporting.',
      icon: Building2
    },
    {
      id: 'q7',
      category: 'tax',
      question: 'Can you help with tax audits and disputes?',
      answer: 'Absolutely! We provide expert representation for tax audits and disputes. Our team has extensive experience in dealing with IRS and other tax authorities. We\'ll represent you, handle all communications, and work towards the best possible outcome.',
      icon: FileText
    },
    {
      id: 'q8',
      category: 'general',
      question: 'What makes Advora Services LLP different from other tax services?',
      answer: 'We differentiate ourselves through personalized service, expertise in both US and Indian tax systems, competitive pricing, and a commitment to client education. Our director, Ramcharan Kotapati, brings over 15 years of experience and a client-centric approach to every engagement.',
      icon: Star
    },
    {
      id: 'q9',
      category: 'contact',
      question: 'How can I reach customer support?',
      answer: 'You can reach our customer support team through multiple channels: phone (USA: +1 (502) 718-0460, India: +91-9700113131), email (usa@advoraservices.com or india@advoraservices.com), or through our website\'s contact form. We\'re available during business hours and typically respond within 24 hours.',
      icon: Phone
    },
    {
      id: 'q10',
      category: 'tax',
      question: 'Do you offer tax planning services?',
      answer: 'Yes, we offer strategic tax planning services to help you minimize your tax liability legally. Our tax planning includes year-round tax strategies, investment planning, retirement planning, and business structuring advice to optimize your tax position.',
      icon: FileText
    },
    {
      id: 'q11',
      category: 'business',
      question: 'What payroll services do you provide?',
      answer: 'Our payroll services include payroll processing, tax withholding calculations, direct deposit setup, payroll tax return filing, year-end W-2 and 1099 preparation, and compliance with labor laws. We ensure accurate and timely payroll processing for your business.',
      icon: Building2
    },
    {
      id: 'q12',
      category: 'general',
      question: 'Are your services confidential?',
      answer: 'Absolutely. We maintain strict confidentiality for all client information. We follow professional ethics and legal requirements to protect your privacy. All your financial and personal information is secure with us.',
      icon: CheckCircle
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = faqCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : HelpCircle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopStrip />
      <Navbar />
      
      <main>
        {/* Image with Centered Breadcrumb */}
        <ImageWithCenteredBreadcrumb
          breadcrumbItems={[
            { label: "FAQ" }
          ]}
          imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&crop=center&q=80"
        />

        {/* Search and Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </motion.div>

              {/* Category Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-wrap justify-center gap-3">
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center space-x-2 rounded-full px-4 py-2 ${
                          activeCategory === category.id
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'border-gray-300 dark:border-gray-600 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {filteredFAQs.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFAQs.map((faq, index) => {
                      const Icon = faq.icon;
                      return (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                        >
                          <AccordionTrigger className="hover:no-underline px-6 py-4">
                            <div className="flex items-center text-left">
                              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                              </div>
                              <span className="text-lg font-medium text-gray-900 dark:text-white ml-3">
                                {faq.question}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-300">
                            <div className="px-6 pb-4 pt-2">
                              {faq.answer}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center py-12"
                >
                  <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No questions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Try adjusting your search or category filter.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    variant="outline"
                    className="border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="gradient-brand text-white border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                    <p className="text-white text-lg">
                      Can't find the answer you're looking for? Our team is here to help.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
                      <p className="text-white mb-4">Chat with our support team</p>
                      <Button
                        variant="secondary"
                        className="bg-white text-brand-600 hover:bg-gray-100 rounded-full"
                      >
                        Start Chat
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                      <p className="text-white mb-4">Speak with our experts</p>
                      <Button
                        variant="secondary"
                        className="bg-white text-brand-600 hover:bg-gray-100 rounded-full"
                      >
                        Call Now
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                      <p className="text-white mb-4">Send us a detailed message</p>
                      <Button
                        variant="secondary"
                        className="bg-white text-brand-600 hover:bg-gray-100 rounded-full"
                      >
                        Send Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}