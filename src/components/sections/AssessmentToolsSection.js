import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  BarChart4, 
  Brain, 
  Video, 
  Award 
} from 'lucide-react';

const ToolRow = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 p-4 sm:p-6 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-500 text-center sm:text-left"
    >
      <div className="relative mb-4 sm:mb-0">
        <motion.div 
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white"
          whileHover={{ scale: 1.05 }}
          whileInView={{ 
            scale: [0.8, 1],
            opacity: [0, 1]
          }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.3 }}
        >
          <Icon size={24} />
        </motion.div>
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-xl border border-blue-500/30 animate-ping" 
             style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 rounded-xl border border-blue-500/15 animate-ping"
             style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
      </div>
      
      <div className="flex-1 relative">
        <motion.div
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="absolute -bottom-2 left-0 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent"
        />
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.15 }}
          className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300"
        >
          {title}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="text-gray-600 leading-relaxed"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

const AssessmentToolsSection = () => {
  const tools = [
    {
      icon: Brain,
      title: "AI-Powered Proctoring",
      description: "Advanced AI monitoring system to ensure test integrity and prevent cheating in real-time"
    },
    {
      icon: Zap,
      title: "Instant Evaluation",
      description: "Automated code evaluation and scoring with detailed performance metrics and insights"
    },
    {
      icon: ShieldCheck,
      title: "Plagiarism Detection",
      description: "Sophisticated code similarity checking and source verification tools"
    },
    {
      icon: Video,
      title: "Video Monitoring",
      description: "Secure remote proctoring with audio-video recording and environment scanning"
    },
    {
      icon: BarChart4,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting with performance tracking and skill gap analysis"
    },
    {
      icon: Award,
      title: "Custom Certificates",
      description: "Automated certificate generation for successful test completion"
    }
  ];

  return (
    <section className="py-8 sm:py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ 
            margin: "-100px",
            amount: 0.3
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ 
              margin: "-100px",
              amount: 0.3
            }}
            transition={{ 
              delay: 0.2,
              duration: 0.5,
              ease: "easeOut"
            }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-100 text-gray-600 mb-4"
          >
            Assessment Tools
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ 
              margin: "-100px",
              amount: 0.3
            }}
            transition={{ 
              delay: 0.3,
              duration: 0.5,
              ease: "easeOut"
            }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Powerful Assessment Tools
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ 
              margin: "-100px",
              amount: 0.3
            }}
            transition={{ 
              delay: 0.4,
              duration: 0.5,
              ease: "easeOut"
            }}
            className="text-lg text-gray-600"
          >
            State-of-the-art tools to make your assessment process efficient and secure
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
          {tools.map((tool, index) => (
            <ToolRow key={index} {...tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AssessmentToolsSection;
