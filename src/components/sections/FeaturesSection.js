import React from 'react';
import { motion } from 'framer-motion';
import { Code, Brain, Shield, Database, Clock, Users, Globe, Cpu } from 'lucide-react';

const FeaturesSection = ({ isStandalone = false }) => {
  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Multiple Programming Languages",
      description: "Support for Python, Java, JavaScript, C++, Ruby, and 15+ other programming languages with real-time compilation.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Smart Assessment System",
      description: "AI-powered code analysis for quality, complexity, and performance metrics with detailed feedback.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Testing Environment",
      description: "Advanced proctoring with AI monitoring, plagiarism detection, and secure browser lockdown features.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Extensive Question Bank",
      description: "Access to 10,000+ curated coding problems and MCQs across different difficulty levels and topics.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const additionalFeatures = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Performance",
      description: "Instant code execution and test results with detailed performance analytics."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaborative Features",
      description: "Team management and shared test environments for better collaboration."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Standards",
      description: "Industry-aligned assessment criteria following global coding standards."
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive reporting with skill mapping and progress tracking."
    }
  ];

  return (
    <section id="features" className={`py-12 relative ${isStandalone ? 'mt-16' : ''}`}>
      <div className="container mx-auto px-4 overflow-visible">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-100 text-gray-600">
            Platform Capabilities
          </span>
          <h2 className="text-4xl font-bold mt-4 mb-6 text-blue-700">
            Our Platform Supports
          </h2>
          <p className="text-gray-600">
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className={`${feature.bgColor} ${feature.color} p-3 rounded-xl h-fit`}>
                {feature.icon}
              </div>
              <div>
                <h3 className={`text-xl font-semibold mb-2 ${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features List */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-2 rounded-lg bg-white shadow-sm mb-4">
                  <motion.div 
                    className="text-blue-600"
                    animate={
                      feature.icon.type === Clock ? {
                        rotate: 360,
                        transition: {
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }
                      } : feature.icon.type === Globe ? {
                        rotate: [0, 360],
                        transition: {
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }
                      } : feature.icon.type === Users ? {
                        scale: [1, 0.9, 1],
                        x: [-2, 2, -2],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      } : feature.icon.type === Cpu ? {
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.8, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0)",
                          "0 0 0 10px rgba(59, 130, 246, 0.1)",
                          "0 0 0 0 rgba(59, 130, 246, 0)"
                        ],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      } : {}
                    }
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 font-serif tracking-wide leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 