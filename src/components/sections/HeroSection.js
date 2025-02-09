import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, CheckCircle, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className={currentIndex === text.length ? 'hidden' : 'inline-block'}
      >
        |
      </motion.span>
    </span>
  );
};

const quotes = [
  "Practice makes perfect, but smart practice makes excellence.",
  "Code with passion, debug with patience.",
  "Every expert was once a beginner who never gave up.",
  "The best way to predict the future is to code it.",
  "Learning to code is learning to create and innovate.",
  "Great coders are made, not born.",
  "Your code is your legacy, make it count.",
  "Coding is today's language of creativity.",
  "The only way to learn programming is by programming.",
  "Think twice, code once.",
  "In coding, simplicity is the ultimate sophistication.",
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Programming is the art of algorithm design.",
  "Clean code always looks like it was written by someone who cares."
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Code className="h-5 w-5" />, text: "Multiple Programming Languages" },
    { icon: <Zap className="h-5 w-5" />, text: "Real-time Assessment" },
    { icon: <CheckCircle className="h-5 w-5" />, text: "Instant Feedback" },
  ];

  const handleStartJourney = () => {
    navigate('/login');
  };

  return (
    <section id="hero" className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-200 to-purple-200 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-200 to-purple-200 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 pt-14 pb-20 relative">
        {/* Enhanced quote badge with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="group inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 text-sm font-medium border border-blue-200/30 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            <AnimatePresence mode='wait'>
              <motion.span
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="font-inter"
              >
                {quotes[currentQuoteIndex]}
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              →
            </motion.span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight font-cabinet-grotesk"
          >
            <TypewriterText text="Master Your Skills Through Practice" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-600 leading-relaxed font-dancing-script"
          >
            <span className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 bg-clip-text text-transparent">
              Transform your coding journey with hands-on practice. Master real-world challenges and build your future in tech.
            </span>
          </motion.p>

          {/* Enhanced Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 my-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-gray-200/50 text-gray-600 shadow-sm hover:shadow-md hover:border-blue-200/50"
              >
                <span className="text-blue-600">{feature.icon}</span>
                <span className="font-medium font-inter">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Modified CTA Button with matching gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <button 
              onClick={handleStartJourney}
              className="group relative flex items-center justify-center gap-3 px-6 py-3 font-bold text-white text-lg
                bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600
                rounded-full border-[3px] border-white/30
                shadow-[0_10px_20px_rgba(0,0,0,0.2)]
                transition-all duration-300 ease-in-out
                hover:scale-105 hover:border-white/60
                overflow-hidden"
            >
              Start Your Journey
              <motion.svg 
                className="w-6 h-6"
                viewBox="0 0 24 24" 
                fill="currentColor"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" 
                  clipRule="evenodd" 
                />
              </motion.svg>
              
              {/* Shine effect */}
              <div className="absolute w-[100px] h-full top-0 -left-[100px] opacity-60
                bg-gradient-to-r from-transparent via-white/80 to-transparent
                group-hover:animate-shine"
              />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
