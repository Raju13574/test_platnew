import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/sections/HeroSection';
import FeaturesSection from '../../components/sections/FeaturesSection';
import HowItWorksSection from '../../components/sections/HowItWorksSection';
import TestimonialsSection from '../../components/sections/TestimonialsSection';
import PricingSection from '../../components/sections/PricingSection';
import FAQsSection from '../../components/sections/FAQsSection';
import TestTypesSection from '../../components/sections/TestTypesSection';
import AssessmentToolsSection from '../../components/sections/AssessmentToolsSection';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle scroll to any section
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      // Clean up the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div id="home">
          <HeroSection />
        </div>
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="test-types">
          <TestTypesSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <div id="assessment-tools">
          <AssessmentToolsSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="faqs">
          <FAQsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
