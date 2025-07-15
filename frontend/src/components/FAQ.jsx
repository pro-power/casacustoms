// frontend/src/components/FAQ.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = ({ showAll = false }) => {
  const [openItems, setOpenItems] = useState(showAll ? new Set([0, 1, 2, 3, 4, 5]) : new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      question: "How do I create custom stickers for my phone case?",
      answer: "Creating custom phone case stickers is easy! Choose your item, enter your custom text (up to 20 characters), select from 9 vibrant colors, and preview your design. Our villa-inspired Love Islander designs look amazing on all phone cases. The process takes less than 2 minutes!"
    },
    {
      question: "What devices work with Casa Customs custom stickers?",
      answer: "Our personalized stickers work perfectly on most phone case models (15 Pro Max, 16 Pro, 14, 13 Pro Max, 13 Pro, 13), Samsung Galaxy phones (S23, S22), water bottles, laptops, tablets, car windows, and any smooth surface. Each custom text sticker is precision-cut for perfect fit."
    },
    {
      question: "How long do custom stickers last on water bottles and phone cases?",
      answer: "Our premium vinyl custom stickers last 3-5 years outdoors and even longer indoors. They're waterproof, UV-resistant, and dishwasher safe. Perfect for daily use on water bottles, phone cases, champagne flutes and laptops. The custom text stays vibrant and won't fade, peel, or crack."
    },
    {
      question: "Can I customize the font and colors for my personalized stickers?",
      answer: "Yes! Our custom stickers feature Island villa-inspired designs that capture that lovely summer romance aesthetic. Choose from 9 beautiful colors including Hot Pink, Orange, Teal, Purple, Yellow, and more. Each color is UV-resistant and designed to maintain vibrancy on any surface."
    },
    {
      question: "How much do custom phone case stickers cost?",
      answer: "All our custom stickers are just $5.95 with FREE shipping! This includes personalized text, your choice of colors, premium vinyl material, and fast delivery. No hidden fees - what you see is what you pay. Perfect quality at an affordable price."
    },
    {
      question: "How fast is shipping for custom stickers?",
      answer: "We offer FREE shipping on all custom sticker orders! Your personalized phone case stickers or water bottle decals ship within 2-3 business days. We use protective packaging to ensure your custom text stickers arrive in perfect condition, ready to apply."
    }
  ];

  // JSON-LD Schema for FAQs (Google rich snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* JSON-LD Schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-love-gradient mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about our custom stickers and personalized phone case decals
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                {openItems.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-pink-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-pink-400 flex-shrink-0" />
                )}
              </button>
              
              {openItems.has(index) && (
                <div className="px-6 pb-5">
                  <p className="text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">
              Have more questions about our custom stickers?
            </p>
            <a 
              href="/how-it-works" 
              className="text-pink-400 hover:text-pink-300 font-semibold"
            >
              Learn more about our design process →
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default FAQ;