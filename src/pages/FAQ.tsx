import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqData } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-text-secondary">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 mb-16">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-xl transition-all duration-200 ${isOpen ? 'border-accent-green/30 bg-brand-elevated' : 'border-brand-border bg-brand-surface'}`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-text-primary pr-8">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent-green' : ''}`} 
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-text-secondary leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-text-secondary mb-4">Still have questions?</p>
          <Link to="/contact" className="btn-secondary">Contact our team</Link>
        </div>
      </div>
    </div>
  );
}
