import React from 'react';
import { Code, FileText, Brain, Puzzle, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const TestTypeRow = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative flex flex-col lg:flex-row items-center gap-6 p-6 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-xl ${
        index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
      }`}
    >
      <div className="relative">
        <motion.div 
          className="absolute inset-0 bg-blue-100 rounded-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div 
          className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Icon size={28} className="text-white" />
        </motion.div>
      </div>
      <div className={`flex-1 space-y-3 text-center lg:text-left ${
        index % 2 === 1 ? 'lg:text-right' : ''
      }`}>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 text-base leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const TestTypesSection = () => {
  const testTypes = [
    {
      icon: Code,
      title: "Coding Assessments",
      description: "Live coding environments with support for 30+ programming languages and real-time compilation"
    },
    {
      icon: FileText,
      title: "MCQ Tests",
      description: "Comprehensive multiple-choice assessments with automated grading and instant results"
    },
    {
      icon: Brain,
      title: "Technical Interviews",
      description: "Structured technical interviews with collaborative coding and whiteboarding tools"
    },
    {
      icon: Puzzle,
      title: "Problem Solving",
      description: "Complex algorithmic challenges and real-world problem-solving scenarios"
    },
    {
      icon: Users,
      title: "Team Projects",
      description: "Collaborative project assessments to evaluate team dynamics and coding practices"
    },
    {
      icon: Target,
      title: "Skill Assessment",
      description: "Targeted evaluations for specific programming languages and frameworks"
    }
  ];

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-blue-600 font-semibold text-lg mb-1 block"
          >
            Comprehensive Solutions
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
          >
            Assessment Types
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-600 leading-relaxed"
          >
            Choose from a variety of assessment formats tailored to your hiring needs
          </motion.p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          {testTypes.map((type, index) => (
            <div 
              key={index} 
              className={`relative ${
                index !== testTypes.length - 1 ? 'after:absolute after:left-1/2 after:-bottom-6 after:w-px after:h-12 after:bg-gray-200 hidden sm:block' : ''
              }`}
            >
              <TestTypeRow {...type} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestTypesSection;
