'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaArrowLeft, FaQuestionCircle, FaShieldAlt, FaCogs, FaHandshake } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is the CardWise White-Label Platform?",
    answer: "The CardWise White-Label Platform is a powerful, AI-driven tool designed for businesses like financial advisors, travel agencies, and content creators. It allows you to offer personalized credit card spending analysis and recommendations to your clients or audience under your own brand.",
    category: "Platform"
  },
  {
    question: "How can this platform benefit my business?",
    answer: "Partnering with CardWise allows you to add a premium, data-driven service to your offerings, enhancing your brand's value and client engagement. It also provides an opportunity to generate significant affiliate revenue through credit card recommendations.",
    category: "Partnership"
  },
  {
    question: "How does the AI analyze client spending data?",
    answer: "Clients securely upload their credit card statements, and our AI engine analyzes spending patterns across various categories. It identifies where clients spend most and calculates potential rewards based on different credit cards, providing data-backed insights.",
    category: "Platform"
  },
  {
    question: "Is my clients' data secure and private?",
    answer: "Yes, client data security and privacy are our highest priorities. We use advanced encryption and comply with industry-standard data protection regulations. Client data is processed securely and not stored longer than necessary for the analysis, nor is it shared with third parties without explicit consent.",
    category: "Security & Data"
  },
  {
    question: "What level of branding customization is available?",
    answer: "Our platform is built for full white-labeling. You can customize the look and feel, integrate your logo and color scheme, and even use your own domain name to ensure a seamless brand experience for your clients.",
    category: "Branding"
  },
  {
    question: "How does the affiliate revenue model work?",
    answer: "The platform integrates with credit card affiliate networks. When your clients apply for and are approved for a credit card recommended through your branded platform, you can earn a commission from the card issuer. We provide the technology to track these conversions.",
    category: "Partnership"
  },
  {
    question: "What kind of support do you offer partners?",
    answer: "We provide comprehensive support for our partners, including technical assistance, guidance on integrating the platform into your services, marketing materials, and support in navigating affiliate partnerships.",
    category: "Support"
  },
   {
    question: "Can I integrate the platform with my existing website or tools?",
    answer: "Yes, the platform is designed for flexible integration. We provide documentation and support to help you embed the CardWise functionality into your existing website, client portals, or other digital tools.",
    category: "Integration"
  },
   {
    question: "How do I get started or see a demo?",
    answer: "You can request a personalized demo through our Contact Us page. Our team will walk you through the platform's features, discuss your specific business needs, and explain the partnership process in detail.",
    category: "Getting Started"
  },
   {
    question: "What types of businesses are ideal partners?",
    answer: "Businesses that serve an audience or clientele interested in personal finance, travel, lifestyle, or maximizing their purchasing power are ideal partners. This includes financial advisors, wealth managers, travel bloggers and agencies, personal finance coaches, and loyalty program experts.",
    category: "Partnership"
  },
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Platform': return FaQuestionCircle;
    case 'Security & Data': return FaShieldAlt;
    case 'Integration': case 'Support': return FaCogs;
    case 'Partnership': case 'Branding': case 'Getting Started': return FaHandshake;
    default: return FaQuestionCircle;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Platform': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Security & Data': return 'bg-red-100 text-red-700 border-red-200';
    case 'Integration': case 'Support': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Partnership': case 'Branding': case 'Getting Started': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-green-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-green-600 hover:text-green-500 mb-8 font-medium"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-8">
                <FaQuestionCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Frequently Asked 
                <span className="text-gradient block mt-2">Questions</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Find answers to common questions about the CardWise white-label platform and how it can benefit your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600">
              Find the information you need quickly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map(category => {
              const IconComponent = getCategoryIcon(category);
              const colorClass = getCategoryColor(category);
              const count = faqs.filter(faq => faq.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`card p-6 text-left group hover:shadow-xl transition-all duration-300 ${
                    selectedCategory === category ? 'ring-2 ring-green-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} border`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {category}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {count} question{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'All'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-200 hover:bg-green-50'
              }`}
            >
              All Questions ({faqs.length})
            </button>
            {categories.map(category => {
              const count = faqs.filter(faq => faq.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-green-200 hover:bg-green-50'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          {selectedCategory !== 'All' && (
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory} Questions
              </h3>
              <p className="text-gray-600">
                {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} in this category
              </p>
            </div>
          )}

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = expandedItems.has(index);
              return (
                <div
                  key={index}
                  className={`card overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'shadow-lg' : 'hover:shadow-lg'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(faq.category)} border`}>
                          {faq.category}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mt-3 group-hover:text-green-600 transition-colors">
                        {faq.question}
                      </h4>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <FaChevronUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <FaChevronDown className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaQuestionCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 mb-6">
                Try selecting a different category or contact us directly.
              </p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="btn btn-outline"
              >
                Show All Questions
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-8">
            <FaHandshake className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Our team is here to help you understand how CardWise can transform your business. 
            Get personalized answers and see the platform in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Contact Our Team
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}