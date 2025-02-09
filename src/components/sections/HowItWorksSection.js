import React from 'react';
import { FileText, Upload, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom PlayTriangle component
const PlayTriangle = () => (
  <div className="relative">
    {/* Main circle */}
    <div className="w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] bg-blue-500 rounded-full flex items-center justify-center">
      {/* Play triangle - adjusted to be wider and more equilateral */}
      <div className="w-0 h-0 ml-1
        border-t-[10px] border-t-transparent 
        border-l-[15px] border-l-white 
        border-b-[10px] border-b-transparent"
        style={{ transform: 'scale(1.2)' }}
      />
    </div>
    
    {/* Animated rings */}
    <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping" 
         style={{ animationDuration: '2s' }} />
    <div className="absolute inset-0 rounded-full border border-blue-500/15 animate-ping"
         style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
  </div>
);

// Add this new custom component near PlayTriangle
const AnimatedFileText = () => (
  <div className="relative w-[36px] h-[36px] sm:w-[42px] sm:h-[42px]">
    <FileText size={36} className="text-blue-500 sm:w-[42px] sm:h-[42px]" />
    {/* First line */}
    <motion.div 
      className="absolute top-[15px] left-[13px] w-[16px] h-[1.5px] bg-blue-500 rounded-full"
      animate={{
        scaleX: [0, 1],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    {/* Second line */}
    <motion.div 
      className="absolute top-[20px] left-[13px] w-[13px] h-[1.5px] bg-blue-500 rounded-full"
      animate={{
        scaleX: [0, 1],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3
      }}
    />
    {/* Third line */}
    <motion.div 
      className="absolute top-[25px] left-[13px] w-[10px] h-[1.5px] bg-blue-500 rounded-full"
      animate={{
        scaleX: [0, 1],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.6
      }}
    />
  </div>
);

const Step = ({ icon, title, description, index }) => {
  const isFileText = icon.type.name === 'FileText';
  
  return (
    <div className="flex flex-col items-center text-center p-4 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group min-h-[260px] sm:min-h-[280px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
      <motion.div 
        className="text-blue-500 mb-6"
        animate={
          icon.type === Upload ? {
            y: [-4, 4, -4],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          } : 
          icon.type === PlayCircle ? {
            scale: [1, 1.15, 1],
            transition: { 
              duration: 2,
              repeat: Infinity, 
              ease: "easeInOut"
            }
          } : 
          icon.type === CheckCircle2 ? {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
            transition: { 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut"
            }
          } : {}
        }
      >
        {isFileText ? (
          <AnimatedFileText />
        ) : icon.type === PlayCircle ? (
          <PlayTriangle />
        ) : (
          React.cloneElement(icon, { 
            size: 36,
            className: "transition-transform duration-300 group-hover:scale-110 sm:w-[42px] sm:h-[42px]" 
          })
        )}
      </motion.div>
      <h3 className="text-[#1a1a1a] text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description}</p>
      <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-tl-2xl flex items-center justify-center text-lg sm:text-xl font-bold">
        {index + 1}
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FileText />,
      title: "Create Assessment",
      description: "Design custom tests with coding challenges and MCQs tailored to your needs. Set time limits, difficulty levels, and choose from our vast question bank."
    },
    {
      icon: <Upload />,
      title: "Invite Candidates",
      description: "Share test links with candidates or integrate with your existing workflow. Manage invites and track candidate responses all in one place."
    },
    {
      icon: <PlayCircle />,
      title: "Take Test",
      description: "Candidates solve problems in a secure, proctored environment with real-time code execution and anti-cheating measures in place."
    },
    {
      icon: <CheckCircle2 />,
      title: "Get Results",
      description: "Receive detailed analytics and insights on candidate performance. Compare scores, review code quality, and make data-driven hiring decisions."
    }
  ];

  return (
    <section className="py-8 sm:py-12 bg-[#f8fafc]">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ 
            margin: "-100px",
            amount: 0.3
          }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ 
              margin: "-100px",
              amount: 0.3
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3 sm:mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ 
              margin: "-100px",
              amount: 0.3
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-600 text-lg"
          >
            Simple steps to start your assessment journey
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {steps.map((step, index) => (
            <Step key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;