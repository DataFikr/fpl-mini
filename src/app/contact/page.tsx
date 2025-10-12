'use client';

import { useState } from 'react';
import { Mail, Send, Clock } from 'lucide-react';
import { FaXTwitter, FaReddit } from 'react-icons/fa6';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success || data.isDemo) {
        setIsSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', email: '', message: '' });
        }, 3000);
      } else {
        alert(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex p-4 rounded-fpl bg-gradient-to-r from-fpl-primary to-fpl-violet-700 mb-6">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-jakarta font-bold text-white mb-4">Contact Us</h1>
              <p className="text-xl font-inter text-fpl-text-secondary">
                Got a question, suggestion, or partnership idea? We'd love to hear from you!
              </p>
            </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 border border-fpl-primary/20">
                <h2 className="text-2xl font-jakarta font-bold text-white mb-6">Get in Touch</h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-fpl-primary/20 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-fpl-accent" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-semibold text-white">Email</h3>
                      <a
                        href="mailto:support@fplranker.com"
                        className="font-inter text-fpl-accent hover:text-fpl-violet-400 transition-colors"
                      >
                        support@fplranker.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-fpl-primary/20 p-3 rounded-lg">
                      <FaXTwitter className="h-6 w-6 text-fpl-accent" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-semibold text-white">X (Twitter)</h3>
                      <a
                        href="https://x.com/fplranker"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-inter text-fpl-accent hover:text-fpl-violet-400 transition-colors"
                      >
                        @FPLRanker
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-fpl-primary/20 p-3 rounded-lg">
                      <FaReddit className="h-6 w-6 text-fpl-accent" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-semibold text-white">Reddit</h3>
                      <a
                        href="https://www.reddit.com/user/fplranker/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-inter text-fpl-accent hover:text-fpl-violet-400 transition-colors"
                      >
                        u/fplranker
                      </a>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="mt-8 p-4 bg-fpl-primary/10 rounded-lg border border-fpl-accent/30">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-fpl-accent" />
                    <span className="font-jakarta font-medium text-white">We aim to respond within 48 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 border border-fpl-primary/20">
              <h2 className="text-2xl font-jakarta font-bold text-white mb-6">Send us a Message</h2>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-fpl bg-fpl-accent/20 mb-4">
                    <Send className="h-8 w-8 text-fpl-accent" />
                  </div>
                  <h3 className="text-xl font-jakarta font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="font-inter text-fpl-text-secondary">Thank you for reaching out. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-jakarta font-medium text-white mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-fpl-dark/60 border border-fpl-primary/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-fpl-accent focus:border-fpl-accent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-jakarta font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-fpl-dark/60 border border-fpl-primary/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-fpl-accent focus:border-fpl-accent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-jakarta font-medium text-white mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-fpl-dark/60 border border-fpl-primary/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-fpl-accent focus:border-fpl-accent transition-colors resize-vertical"
                      placeholder="Tell us about your question, suggestion, or how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl-glow-violet focus:outline-none focus:ring-2 focus:ring-fpl-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </>
  );
}