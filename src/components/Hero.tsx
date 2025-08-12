import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8 text-center animate-fade-in-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-text-primary mb-4 sm:mb-6 leading-[1.2]">
          Для тебя. Каждый день.
          <span className="block font-sans text-text-primary text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mt-4">
            Твой AI-ассистент: поддержка, вдохновение и забота о тебе каждый день.
          </span>
        </h1>

        <p className="text-text-secondary mt-6">Начни свой день с вдохновения</p>
      </div>
    </section>
  );
};