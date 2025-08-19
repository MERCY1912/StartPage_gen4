import React from 'react';
import ReactDOM from 'react-dom';
import { Menu, X, Globe, Music, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthModal } from './AuthModal';
import AccountModal from './AccountModal';
import { UsageTracker } from '../utils/usageTracker';
import HeaderPremium from './HeaderPremium';

type HeaderProps = Record<string, never>;

export const Header: React.FC<HeaderProps> = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showAccountModal, setShowAccountModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAtmosphereMode, setIsAtmosphereMode] = React.useState<boolean>(false);
  const [showAtmosphereTooltip, setShowAtmosphereTooltip] = React.useState<boolean>(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleAuthAction = () => {
    if (user) {
      setShowAccountModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = async () => {
    // Refresh usage data after successful authentication
    try {
      const { data: { user: currentUser } } = await import('../supabaseClient').then(m => m.supabase.auth.getUser());
      if (currentUser) {
        await UsageTracker.migrateAnonymousUsage(currentUser.id);
      }
    } catch (error) {
      console.error('Error during auth success:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Эффект для управления фоновой музыкой
  React.useEffect(() => {
    if (isAtmosphereMode) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://ygpenhsaqtaoxmjaruad.supabase.co/storage/v1/object/public/audio//background_ambient.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3; // Тихий фоновый звук
      }
      
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
        } catch (error) {
          console.warn('Не удалось воспроизвести аудио (возможно, заблокировано браузером):', error);
        }
      };
      
      playAudio();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    // Очистка при размонтировании компонента
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [isAtmosphereMode]);

  return (
    <>
      <header className="relative z-20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img src="http://blog.femmify.me/wp-content/uploads/2025/08/Femmify-logo4.png" alt="Femmify logo" className="h-10 w-auto" />
        </a>
        
        {/* Right side controls */}
        <div className="hidden sm:flex items-center space-x-8">
          {/* Atmosphere Toggle */}
          <div className="flex items-center space-x-2">
            <Music className={`w-4 h-4 transition-colors duration-300 ease-in-out ${isAtmosphereMode ? 'text-accent' : 'text-text-secondary'}`} />
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowAtmosphereTooltip(true)}
                onMouseLeave={() => setShowAtmosphereTooltip(false)}
                className="text-text-secondary hover:text-text-primary transition-colors duration-300 ease-in-out"
              >
                <HelpCircle className="w-3 h-3" />
              </button>
              {showAtmosphereTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-text-primary border border-text-secondary/20 rounded-lg text-xs text-background whitespace-nowrap shadow-lg z-50">
                  {t('interactive.atmosphereModeTooltip')}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary"></div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsAtmosphereMode(!isAtmosphereMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                isAtmosphereMode ? 'bg-gradient-to-r from-primary to-accent' : 'bg-text-secondary/30'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                  isAtmosphereMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Language Toggle */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-border rounded-full p-1">
          <Globe className="w-4 h-4 text-text-secondary ml-2" />
          <button
            onClick={() => setLanguage('ru')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              language === 'ru'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/40'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              language === 'en'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/40'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            ENG
          </button>
        </div>
        </div>
        
        <nav className="flex items-center space-x-2 sm:space-x-4 xl:space-x-6">
          <a href="#about" className="relative group hidden lg:block px-3 py-2">
            <span className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary group-hover:opacity-90 transition-opacity duration-300 text-shadow">
              {t('nav.about')}
            </span>
            <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-secondary to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center"></span>
          </a>
          <a href="#articles" className="relative group px-3 py-2">
            <span className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary group-hover:opacity-90 transition-opacity duration-300 text-shadow">
              {t('nav.articles')}
            </span>
            <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-secondary to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center"></span>
          </a>
          <HeaderPremium />
          <button
            onClick={handleAuthAction}
            className="hidden lg:flex px-4 lg:px-6 py-2 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-primary/30 text-sm lg:text-base items-center space-x-2 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/50"
          >
            <span>{user ? t('account') : t('login')}</span>
          </button>
        </nav>

        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden text-text-primary hover:text-primary transition-colors duration-300 ease-in-out"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && ReactDOM.createPortal(
          <div className="fixed top-0 left-0 right-0 bottom-0 lg:hidden z-[9999] pt-20">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
              <nav className="px-4 py-6 space-y-4">
                {/* Mobile Language Toggle */}
                <div className="space-y-6 mb-4">
                  {/* Mobile Atmosphere Toggle */}
                  <div className="flex items-center justify-center space-x-3">
                    <Music className={`w-4 h-4 transition-colors duration-300 ease-in-out ${isAtmosphereMode ? 'text-accent' : 'text-text-secondary'}`} />
                    <span className="text-sm text-text-secondary">{t('interactive.atmosphereMode')}</span>
                    <button
                      type="button"
                      onClick={() => setIsAtmosphereMode(!isAtmosphereMode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                        isAtmosphereMode ? 'bg-gradient-to-r from-primary to-accent' : 'bg-text-secondary/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                          isAtmosphereMode ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Mobile Language Toggle */}
                  <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm border border-border rounded-full p-1">
                  <Globe className="w-4 h-4 text-text-secondary ml-2" />
                  <button
                    onClick={() => {
                      setLanguage('ru');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                      language === 'ru'
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/20'
                    }`}
                  >
                    RU
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                      language === 'en'
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/20'
                    }`}
                  >
                    ENG
                  </button>
                </div>
                </div>
                
                <a 
                  href="#about" 
                  className="block text-text-secondary hover:text-primary transition-colors duration-300 ease-in-out py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.about')}
                </a>
                <button 
                  onClick={() => {
                    handleAuthAction();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-base flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 mt-4"
                >
                  <span>{user ? t('account') : t('login')}</span>
                </button>
              </nav>
            </div>
          </div>
        , document.getElementById('modal-root')!)}
      </div>
      </header>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
      <AccountModal
        open={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onOpenAuth={() => {
          setShowAccountModal(false);
          setShowAuthModal(true);
        }}
      />
    </>
  );
};
