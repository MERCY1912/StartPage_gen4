import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InteractivePanel } from './components/InteractivePanel';
import { Footer } from './components/Footer';
import { FloatingPetals } from './components/FloatingPetals';
import WaveAnimation from './components/WaveAnimation';
import { CursorTrail } from './components/CursorTrail';
import { CursorTracker } from './components/CursorTracker';
import PricingModal from './components/PricingModal';

function App() {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary font-sans relative overflow-hidden">
          {/* Particle animation background */}
          <FloatingPetals />
          <WaveAnimation />
          
          {/* Cursor trail effect */}
          <CursorTrail />
          
          {/* Cursor position tracker */}
          <CursorTracker />
          
          {/* Main content */}
          <div className="relative z-10">
            <Header onPremiumClick={() => setIsPricingModalOpen(true)} />
            <Hero />
            <InteractivePanel />
            <Footer />
          </div>

          <PricingModal open={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;