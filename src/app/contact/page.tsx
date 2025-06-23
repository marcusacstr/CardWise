'use client';

import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    businessType: '',
    businessSize: '',
    currentRevenue: '',
    clientBase: '',
    currentTools: '',
    timeframe: '',
    budget: '',
    message: '',
    inquiryType: 'demo'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        businessType: '',
        businessSize: '',
        currentRevenue: '',
        clientBase: '',
        currentTools: '',
        timeframe: '',
        budget: '',
        message: '',
        inquiryType: 'demo'
      });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form after success message
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        businessType: '',
        businessSize: '',
        currentRevenue: '',
        clientBase: '',
        currentTools: '',
        timeframe: '',
        budget: '',
        message: '',
        inquiryType: 'demo'
      });
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-green-600 hover:text-green-500 mb-8 font-medium"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Request Your Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how CardWise can transform your business with personalized credit card recommendations. 
              Complete the form below to schedule your demo and get custom pricing for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Custom Demo</h2>
                <p className="text-gray-600 mb-8">
                  Complete this form and we'll contact you within 24 hours to schedule your personalized demo.
                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-700 mb-2">
                      What can we help you with?
                    </label>
                    <select
                      id="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="demo">Request a Demo</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="pricing">Pricing Information</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                    </select>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                        Company / Organization *
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter your company name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Business Qualifying Questions */}
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your business</h3>
                    
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-2">
                        Which of the following best describes your business? *
                      </label>
                      <select
                        id="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select your business type</option>
                        <option value="financial-advisor">Financial Advisor</option>
                        <option value="influencer">Influencer/Content Creator</option>
                        <option value="travel-agent">Travel Agent/Agency</option>
                        <option value="blogger">Blogger/Website Owner</option>
                        <option value="affiliate-marketer">Affiliate Marketer</option>
                        <option value="fintech">Fintech Company</option>
                        <option value="media-company">Media Company</option>
                        <option value="consulting">Business Consultant</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="businessSize" className="block text-sm font-semibold text-gray-700 mb-2">
                        What's the size of your business? *
                      </label>
                      <select
                        id="businessSize"
                        value={formData.businessSize}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select business size</option>
                        <option value="solo">Solo entrepreneur</option>
                        <option value="small">Small team (2-10 people)</option>
                        <option value="medium">Medium business (11-50 people)</option>
                        <option value="large">Large business (50+ people)</option>
                        <option value="enterprise">Enterprise (500+ people)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="clientBase" className="block text-sm font-semibold text-gray-700 mb-2">
                        How many clients/customers do you currently serve? *
                      </label>
                      <select
                        id="clientBase"
                        value={formData.clientBase}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select client base size</option>
                        <option value="0-100">0-100 clients</option>
                        <option value="100-500">100-500 clients</option>
                        <option value="500-1000">500-1,000 clients</option>
                        <option value="1000-5000">1,000-5,000 clients</option>
                        <option value="5000+">5,000+ clients</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="currentRevenue" className="block text-sm font-semibold text-gray-700 mb-2">
                        What's your approximate annual revenue? *
                      </label>
                      <select
                        id="currentRevenue"
                        value={formData.currentRevenue}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select revenue range</option>
                        <option value="0-50k">/bin/zsh - ,000</option>
                        <option value="50k-100k">,000 - ,000</option>
                        <option value="100k-500k">,000 - ,000</option>
                        <option value="500k-1m">,000 - M</option>
                        <option value="1m-5m">M - M</option>
                        <option value="5m+">M+</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Implementation Questions */}
                  <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation details</h3>
                    
                    <div>
                      <label htmlFor="timeframe" className="block text-sm font-semibold text-gray-700 mb-2">
                        When would you like to get started? *
                      </label>
                      <select
                        id="timeframe"
                        value={formData.timeframe}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select timeframe</option>
                        <option value="immediately">Immediately</option>
                        <option value="1-2-weeks">Within 1-2 weeks</option>
                        <option value="1-month">Within 1 month</option>
                        <option value="3-months">Within 3 months</option>
                        <option value="6-months">Within 6 months</option>
                        <option value="just-exploring">Just exploring options</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                        What's your monthly budget for this type of solution? *
                      </label>
                      <select
                        id="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select budget range</option>
                        <option value="under-100">Under /month</option>
                        <option value="100-300">-300/month</option>
                        <option value="300-500">-500/month</option>
                        <option value="500-1000">-1,000/month</option>
                        <option value="1000+">,000+/month</option>
                        <option value="need-roi-info">Need ROI information first</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="currentTools" className="block text-sm font-semibold text-gray-700 mb-2">
                        What tools do you currently use for client recommendations?
                      </label>
                      <input
                        type="text"
                        id="currentTools"
                        value={formData.currentTools}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., spreadsheets, other software, manual process"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional comments or questions
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="input resize-none"
                      placeholder="Tell us about your specific needs or any questions you have..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn btn-primary text-lg py-4 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaPaperPlane className="mr-2 h-4 w-4" />
                        Request Demo & Get Pricing
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h2>
                
                {/* Contact Methods */}
                <div className="space-y-6 mb-10">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                      <p className="text-gray-600 mb-2">Send us an email and we'll respond promptly</p>
                      <a 
                        href="mailto:partnerships@cardwise.com" 
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        partnerships@cardwise.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaPhone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                      <p className="text-gray-600 mb-2">Speak with our team directly</p>
                      <a 
                        href="tel:+1-555-CARDWISE" 
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        +1 (555) CARDWISE
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
                      <p className="text-gray-600">
                        123 Innovation Drive<br />
                        Tech Hub, CA 94301<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="text-gray-900 font-medium">9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="text-gray-900 font-medium">10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="text-gray-900 font-medium">Closed</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <Link 
                    href="/pricing" 
                    className="block text-green-600 hover:text-green-700 font-medium"
                  >
                    View Pricing Plans →
                  </Link>
                  <Link 
                    href="/about" 
                    className="block text-green-600 hover:text-green-700 font-medium"
                  >
                    Learn About CardWise →
                  </Link>
                  <Link 
                    href="/contact" 
                    className="block text-green-600 hover:text-green-700 font-medium"
                  >
                    Request Demo →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
} 