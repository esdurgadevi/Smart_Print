import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import Footer from '../components/layout/Footer';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { authModal, closeAuthModal } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />
    </div>
  );
};

export default Home;