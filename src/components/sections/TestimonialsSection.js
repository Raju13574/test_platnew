import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star, Quote, CheckCircle } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: "Sarah Chen",
      gender: "female",
      role: "Senior Software Engineer",
      company: "Google",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      quote: "The AI-driven feedback system has transformed how I approach code reviews. It's like having a mentor available 24/7.",
      rating: 5,
      verified: true,
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      impact: "Improved team productivity by 40%"
    },
    {
      name: "Michael Rodriguez",
      gender: "male",
      role: "Lead Developer",
      company: "Microsoft",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      quote: "Outstanding platform for team assessments. The collaborative features are game-changing.",
      rating: 5,
      verified: true,
      expertise: ["Cloud Architecture", "Azure", "DevOps"],
      impact: "Reduced hiring time by 60%"
    },
    {
      name: "Emily Taylor",
      gender: "female",
      role: "Backend Engineer",
      company: "Amazon",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      quote: "The depth of the assessment criteria and quality of feedback is unmatched.",
      rating: 5,
      verified: true,
      expertise: ["Java", "AWS", "Microservices"],
      impact: "Scaled system performance by 200%"
    },
    {
      name: "Alex Johnson",
      gender: "male",
      role: "CTO",
      company: "TechFlow Solutions",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      quote: "As a startup, this platform helped us maintain high coding standards from day one.",
      rating: 5,
      verified: true,
      expertise: ["JavaScript", "React", "Node.js"],
      impact: "Successfully launched 3 products"
    },
    {
      name: "Lisa Wong",
      gender: "female",
      role: "Full Stack Developer",
      company: "InnovateTech Startup",
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      quote: "The real-time assessment features have significantly accelerated our development cycle.",
      rating: 5,
      verified: true,
      expertise: ["Vue.js", "Python", "Docker"],
      impact: "Deployed 15+ features in 3 months"
    }
  ];

  useEffect(() => {
    let intervalId;

    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section 
      className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-blue-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -right-24 -top-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-100 text-gray-600"
          >
            Success Stories
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold mt-4 mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent"
          >
            What Our Users Say
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 text-lg"
          >
            Join thousands of developers who have transformed their coding journey
          </motion.p>
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-10 px-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            className="p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Section */}
                <div className="md:w-1/3">
                  <div className="relative">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1"
                    >
                      <img
                        src={testimonials[currentIndex]?.image}
                        alt={testimonials[currentIndex]?.name || 'Testimonial'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </motion.div>
                    {testimonials[currentIndex]?.verified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-2 -bottom-2 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Expertise Tags */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {testimonials[currentIndex]?.expertise?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:w-2/3">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonials[currentIndex]?.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  <Quote className="w-10 h-10 text-blue-100 mb-4" />
                  <p className="text-gray-600 text-lg mb-6 italic leading-relaxed">
                    "{testimonials[currentIndex]?.quote}"
                  </p>

                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentIndex]?.name}
                    </div>
                    <div className="text-gray-500">
                      {testimonials[currentIndex]?.role} at{' '}
                      <span className="text-blue-600">
                        {testimonials[currentIndex]?.company}
                      </span>
                    </div>
                    {testimonials[currentIndex]?.impact && (
                      <div className="mt-2 text-green-600 font-medium">
                        🚀 {testimonials[currentIndex]?.impact}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 