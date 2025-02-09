import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "5 Tests per month",
        "Basic Proctoring",
        "20+ Languages",
        "Basic Analytics",
        "Email Support"
      ],
      buttonText: "Get Started",
      buttonClass: "bg-blue-500",
      path: "/register"
    },
    {
      name: "Professional",
      price: isAnnual ? "$39" : "$49",
      period: "/mo",
      features: [
        "Unlimited Tests",
        "AI Proctoring",
        "All Languages",
        "Advanced Analytics",
        "Priority Support"
      ],
      buttonText: "Start Trial",
      buttonClass: "bg-purple-500",
      path: "/register",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Custom Test Limits",
        "Custom Security",
        "API Access",
        "Custom Reports",
        "Dedicated Support"
      ],
      buttonText: "Contact Sales",
      buttonClass: "bg-orange-500",
      path: "/contact"
    }
  ];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent"
        >
          Simple, Transparent Pricing
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 text-center mb-8"
        >
          Choose the plan that's right for you
        </motion.p>

        {/* Animated Billing Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center items-center gap-4 mb-12"
        >
          <span className={!isAnnual ? 'font-bold' : ''}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-gray-200 rounded-full relative"
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all
              ${isAnnual ? 'right-1' : 'left-1'}`} 
            />
          </button>
          <span className={isAnnual ? 'font-bold' : ''}>Annual</span>
        </motion.div>

        {/* Animated Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className={`relative bg-white rounded-lg shadow-sm p-8
                ${plan.popular ? 'border-2 border-purple-500' : ''}
              `}
            >
              {plan.popular && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white 
                           px-3 py-1 rounded-full text-sm"
                >
                  Most Popular
                </motion.span>
              )}

              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                <div className="text-3xl font-bold">
                  {plan.price}
                  {plan.period && <span className="text-base font-normal">{plan.period}</span>}
                </div>
              </motion.div>

              <motion.ul 
                className="space-y-4 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </motion.ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(plan.path)}
                className={`w-full py-3 rounded-lg text-white font-medium transition-all
                  ${plan.buttonClass} hover:opacity-90`}
              >
                {plan.buttonText}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
