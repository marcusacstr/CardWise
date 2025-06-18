'use client';

import React from 'react';
// Assuming useState is imported if needed for a more complex form
// import { useState } from 'react';
// import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa'; // Removed unused imports

export default function ContactPage() {
  // If using state for form, initialize it here
  // const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });

  // Handle form submission (mockup - actual submission would go here)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Process form data, e.g., send to an API route
    console.log('Form submitted'); // Replace with actual submission logic
    // console.log(formData);
  };

  // Handle input changes if using state
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setFormData({ ...formData, [e.target.id]: e.target.value });
  // };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Get in Touch</h1>
      <div className="max-w-2xl mx-auto text-lg text-muted-foreground space-y-6">
        <p>
          Interested in becoming a CardWise partner or have questions about our white-label platform?
          Fill out the form below or reach out to us directly, and we&apos;ll be happy to assist you.
        </p>
        
        {/* Simple Contact Form Mockup */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-foreground bg-input"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-foreground bg-input"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-foreground">Company (Optional)</label>
            <input 
              type="text" 
              id="company" 
              name="company"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-foreground bg-input"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground">Message</label>
            <textarea 
              id="message" 
              name="message"
              rows={4} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-foreground bg-input"
            ></textarea>
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Send Message</button>
          </div>
        </form>

        <div className="text-center mt-8">
          <p className="text-lg font-semibold text-foreground">Direct Contact:</p>
          <p>Email: <a href="mailto:info@cardwise.com" className="text-primary hover:underline">info@cardwise.com</a></p>
          {/* Add other contact details if necessary */}
        </div>

      </div>
    </div>
  );
} 