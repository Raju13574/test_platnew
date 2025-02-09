import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQsSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I get started with the platform?",
      answer: "Getting started is easy! Simply sign up for a free account, verify your email, and you can begin exploring our platform. We offer a guided tutorial for new users and comprehensive documentation to help you make the most of our features."
    },
    {
      question: "What programming languages do you support?",
      answer: "We support over 20+ programming languages including Python, JavaScript, Java, C++, Ruby, Go, TypeScript, PHP, Swift, Kotlin, and more. Our platform provides real-time compilation and execution for all supported languages with integrated debugging tools."
    },
    {
      question: "How does the code assessment work?",
      answer: "Our platform uses a sophisticated evaluation system that analyzes multiple aspects of code: correctness, efficiency, style, and best practices. Tests are run against multiple test cases, and we provide detailed feedback on performance, complexity, and potential improvements."
    },
    {
      question: "What anti-cheating measures are in place?",
      answer: "We employ multiple layers of security including AI-powered proctoring that monitors screen activity and behavior, advanced plagiarism detection, secure browser mode, and real-time monitoring. We also use randomized question banks and time-based restrictions."
    },
    {
      question: "Can I customize the test environment?",
      answer: "Yes! You can customize IDE settings, allowed languages, test duration, scoring criteria, and more. Enterprise users can also add custom branding, integrate with their existing systems, and create custom testing workflows."
    },
    {
      question: "What kind of analytics and reporting do you provide?",
      answer: "Our comprehensive analytics suite includes detailed performance metrics, skill assessments, progress tracking, comparative analysis, and custom reporting. You can track individual and team progress, identify skill gaps, and generate detailed reports with actionable insights."
    },
    {
      question: "Is there a limit to the number of tests I can create?",
      answer: "Free accounts can create up to 5 tests per month. Professional accounts have unlimited test creation, while Enterprise accounts get additional features like custom test templates and bulk test generation."
    },
    {
      question: "How do you ensure the quality of assessments?",
      answer: "Each assessment is carefully designed by industry experts and undergoes rigorous testing. We regularly update our question bank, validate test cases, and incorporate user feedback to maintain high-quality standards."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/50 via-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Find answers to common questions about our platform
          </motion.p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-gray-100/50 hover:border-blue-100/50 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 hover:bg-blue-50/50"
                >
                  <span className="text-lg font-medium text-gray-900 text-left">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-500 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-blue-50/30 border-t border-blue-100/20">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQsSection;
