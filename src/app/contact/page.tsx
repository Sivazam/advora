'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SimpleUSPBanner from '@/components/SimpleUSPBanner';

import TopStrip from '@/components/TopStrip';
import SimpleHeroBanner from '@/components/SimpleHeroBanner';
import ImageHeroBanner from '@/components/ImageHeroBanner';
import ScrollToTop from '@/components/ScrollToTop';
import BreadcrumbOnly from '@/components/BreadcrumbOnly';
import ImageWithCenteredBreadcrumb from '@/components/ImageWithCenteredBreadcrumb';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Building,
  Globe,
  Send,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      title: 'USA Office',
      address: '1103 Hidden Ridge APT 1012, Irving, Texas, 75038',
      phone: '+1 (502) 718-0460',
      email: 'usa@advoraservices.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM EST',
      icon: Globe
    },
    {
      title: 'India Office',
      address: 'Plot No 19, 1st floor, Power Nagar, Power Nagar Park Road, Moosapet, Hyderabad, 500018',
      phone: '+91-9491941299',
      email: 'india@advoraservices.com',
      hours: 'Mon-Sat: 10:00 AM - 7:00 PM IST',
      icon: Building
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f4c8' }}>
      {/* <TopStrip /> */}
      
      <main>
        {/* Image with Centered Breadcrumb */}
        <ImageWithCenteredBreadcrumb
          breadcrumbItems={[
            { label: "Contact" }
          ]}
          imageUrl="https://images.unsplash.com/uploads/1413222992504f1b734a6/1928e537?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNvbnRhY3R8ZW58MHx8MHx8fDA?w=1920&h=1080&fit=crop&crop=center&q=80"
        />

        {/* Simple USP Banner */}
        <SimpleUSPBanner />

        {/* Contact Information */}
        <section className="py-20" style={{ backgroundColor: '#f7f4c8' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full overflow-hidden shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={info.title === 'USA Office' 
                          ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2ZmaWNlJTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=80'
                          : 'https://images.unsplash.com/photo-1652503591857-0dbb07631692?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW5kYWluJTIwb2ZmaWNlJTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=80'
                        }
                        alt={info.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <info.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{info.title}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Address</h4>
                          <p className="text-gray-600 dark:text-gray-300">{info.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Phone</h4>
                          <p className="text-gray-600 dark:text-gray-300">{info.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Email</h4>
                          <p className="text-gray-600 dark:text-gray-300">{info.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Business Hours</h4>
                          <p className="text-gray-600 dark:text-gray-300">{info.hours}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        {/* <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Send Us a Message
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Have questions? We'd love to hear from you.
                </p>
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white text-center">
                    Get in Touch
                  </CardTitle>
                  <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-gray-900 dark:text-white">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-900 dark:text-white">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject" className="text-gray-900 dark:text-white">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          placeholder="How can we help you?"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message" className="text-gray-900 dark:text-white">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={6}
                          className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                          placeholder="Please describe your inquiry in detail..."
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full gradient-brand hover:gradient-brand-dark text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section> */}

        {/* Quick Contact */}
        <section className="py-20" style={{ backgroundColor: '#f7f4c8' }}>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Call Us</h3>
                      <p className="text-white mb-2">USA: +1 (502) 718-0460</p>
                      <p className="text-white">India: +91-9491941299</p>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Email Us</h3>
                      <p className="text-white mb-2">usa@advoraservices.com</p>
                      <p className="text-white">india@advoraservices.com</p>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Business Hours</h3>
                      <p className="text-white mb-2">USA: Mon-Fri 9AM-6PM EST</p>
                      <p className="text-white">India: Mon-Sat 10AM-7PM IST</p>
                    </div>
                  </div>
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