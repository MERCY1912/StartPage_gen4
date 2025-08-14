import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold font-serif bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('footer.brandName')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-text-secondary text-xs sm:text-sm">
            <span>{t('footer.createdWith')}</span>
            <Heart className="w-4 h-4 text-primary animate-pulse" />
            <span>{t('footer.forSeekers')}</span>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50 text-center text-text-secondary text-xs sm:text-sm">
          <p>
            <span>{t('footer.copyright')}</span>
            <span className="mx-2">|</span>
            <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
            <span className="mx-2">|</span>
            <a href="/offer.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
          </p>
        </div>
      </div>
    </footer>
  );
};