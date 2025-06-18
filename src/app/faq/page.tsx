'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
      <section className="w-full bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions for Partners
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about the CardWise white-label platform and how it can benefit your business.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  {expandedItems.has(index) ? (
                    <FaChevronUp className="text-muted-foreground" />
                  ) : (
                    <FaChevronDown className="text-muted-foreground" />
                  )}
                </button>
                {expandedItems.has(index) && (
                  <div className="px-6 py-4 border-t border-border">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}