import React, { useState } from 'react';
import { Send, Loader2, Cat, Copy, Check, HelpCircle, Sun, BrainCircuit, Shirt, HeartHandshake, Sparkles, Coffee } from 'lucide-react';
import { UsageTracker, UsageData } from '../utils/usageTracker';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UsageIndicator } from './UsageIndicator';
import { AuthModal } from './AuthModal';
import { getTarotCardsList, selectRandomCards, TarotCard } from '../utils/supabaseStorage';

interface Service {
  id: string;
  icon: any;
  titleKey: string;
  descriptionKey: string;
  placeholderKey: string;
}

import { Sprout, BookOpen, Sun, Coffee, Calendar, Shirt } from 'lucide-react';

const getServices = (t: (key: string) => string): Service[] => [
  {
    id: 'style',
    icon: Shirt,
    titleKey: 'Образы и стиль',
    descriptionKey: 'Подбор одежды, макияжа, аксессуаров для любого случая.',
    placeholderKey: 'Что надеть на свидание осенью?',
  },
  {
    id: 'recipes',
    icon: Coffee,
    titleKey: 'Рецепты',
    descriptionKey: 'Простые и вкусные блюда на каждый день.',
    placeholderKey: 'Придумай лёгкий ужин за 20 минут',
  },
  {
    id: 'wellness',
    icon: Sprout,
    titleKey: 'Здоровье и спокойствие',
    descriptionKey: 'Фитнес, питание, расслабление, медитация.',
    placeholderKey: 'Как успокоиться перед важной встречей?',
  },
  {
    id: 'relationships',
    icon: HeartHandshake,
    titleKey: 'Отношения',
    descriptionKey: 'Советы по любви, дружбе и общению.',
    placeholderKey: 'Как намекнуть парню, что он мне нравится?',
  },
  {
    id: 'mood',
    icon: Sparkles,
    titleKey: 'Настроение и вдохновение',
    descriptionKey: 'Мотивация, добрые слова, аффирмации.',
    placeholderKey: 'Скажи что-то тёплое на ночь',
  },
  {
    id: 'selfcare',
    icon: Sun,
    titleKey: 'Уход за собой',
    descriptionKey: 'Кожа, волосы, ногти, бьюти-лайфхаки.',
    placeholderKey: 'Как ухаживать за кожей зимой?',
  },
  {
    id: 'career',
    icon: BrainCircuit,
    titleKey: 'Работа и развитие',
    descriptionKey: 'Карьера, хобби, личный рост.',
    placeholderKey: 'Как просить повышение?',
  },
  {
    id: 'hobbies',
    icon: BookOpen,
    titleKey: 'Идеи для досуга',
    descriptionKey: 'Рукоделие, декор, творческие занятия.',
    placeholderKey: 'Как сделать свечу своими руками?',
  },
];


export const InteractivePanel: React.FC = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<string>('style');
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [meowMode, setMeowMode] = useState<boolean>(false);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showMeowTooltip, setShowMeowTooltip] = useState<boolean>(false);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState<number>(0);
  
  const { user, loading: authLoading } = useAuth();
  const services = getServices(t);

  const currentService = services.find(s => s.id === selectedService) || services[0];

  // Load usage data
  React.useEffect(() => {
    const loadUsage = async () => {
      if (authLoading) return;
      
      try {
        const usageData = await UsageTracker.getTodayUsage(user?.id);
        const remainingRequests = await UsageTracker.getRemainingRequests(user?.id);
        setUsage(usageData);
        setRemaining(remainingRequests);
      } catch (error) {
        console.error('Error loading usage data:', error);
      }
    };

    loadUsage();
  }, [user, authLoading]);

  // Эффект для смены текста загрузки каждые 2 секунды
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      const loadingMessages = t('interactive.buttons.loadingMessages');
      const messages = Array.isArray(loadingMessages) ? loadingMessages : [t('interactive.buttons.loading')];
      
      interval = setInterval(() => {
        setCurrentLoadingMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 2000);
    } else {
      setCurrentLoadingMessageIndex(0); // Сброс индекса при остановке загрузки
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, t]);

  const refreshUsage = async () => {
    try {
      const usageData = await UsageTracker.getTodayUsage(user?.id);
      const remainingRequests = await UsageTracker.getRemainingRequests(user?.id);
      setUsage(usageData);
      setRemaining(remainingRequests);
    } catch (error) {
      console.error('Error refreshing usage data:', error);
    }
  };

  const getWebhookUrl = (serviceId: string, meowModeEnabled: boolean = false): string => {
    const webhookUrls = {
      'style': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_STYLE_MEOW : import.meta.env.VITE_N8N_WEBHOOK_STYLE,
      'recipes': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_RECIPES_MEOW : import.meta.env.VITE_N8N_WEBHOOK_RECIPES,
      'wellness': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_WELLNESS_MEOW : import.meta.env.VITE_N8N_WEBHOOK_WELLNESS,
      'relationships': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_RELATIONSHIPS_MEOW : import.meta.env.VITE_N8N_WEBHOOK_RELATIONSHIPS,
      'mood': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_MOOD_MEOW : import.meta.env.VITE_N8N_WEBHOOK_MOOD,
      'selfcare': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_SELFCARE_MEOW : import.meta.env.VITE_N8N_WEBHOOK_SELFCARE,
      'career': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_CAREER_MEOW : import.meta.env.VITE_N8N_WEBHOOK_CAREER,
      'hobbies': meowModeEnabled ? import.meta.env.VITE_N8N_WEBHOOK_HOBBIES_MEOW : import.meta.env.VITE_N8N_WEBHOOK_HOBBIES,
    };
    
    return webhookUrls[serviceId as keyof typeof webhookUrls] || webhookUrls['style'];
  };

  const sendToN8N = async (serviceId: string, userInput: string, tarotCardNames?: string[], meowModeEnabled?: boolean): Promise<string> => {
  const webhookUrl = getWebhookUrl(serviceId, meowModeEnabled);
    
    // Проверяем наличие URL вебхука
    if (!webhookUrl || webhookUrl.includes('your-n8n-instance.com')) {
     const envVarName = meowModeEnabled ? `VITE_N8N_WEBHOOK_${serviceId.toUpperCase()}_MEOW` : `VITE_N8N_WEBHOOK_${serviceId.toUpperCase()}`;
      throw new Error(`Вебхук n8n для сервиса "${serviceId}"${meowModeEnabled ? ' (мяу-режим)' : ''} не настроен. Проверьте переменную окружения ${envVarName}`);
    }

    // Проверяем валидность URL
    try {
      new URL(webhookUrl);
    } catch (urlError) {
      throw new Error(`Некорректный URL вебхука для сервиса "${serviceId}": ${webhookUrl}`);
    }

    const payload: any = {
      service: serviceId,
      input: userInput,
      userId: user?.id || null,
      timestamp: new Date().toISOString(),
      userEmail: user?.email || null,
      meowMode: meowModeEnabled || false,
    };

    // Для таро добавляем выбранные карты
    if (serviceId === 'tarot' && tarotCardNames && tarotCardNames.length > 0) {
      payload.selectedCards = tarotCardNames.join(',');
    }

    console.log('Отправка запроса в n8n:', { webhookUrl, payload });
    
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      console.error('Ошибка сети при подключении к n8n:', fetchError);
      
      // Определяем тип ошибки сети
      if (fetchError instanceof TypeError) {
        if (fetchError.message.includes('Failed to fetch')) {
          throw new Error(`Не удается подключиться к n8n по адресу: ${webhookUrl}. Проверьте:\n• Запущен ли n8n сервер\n• Правильность URL в .env файле\n• Настройки CORS в n8n`);
        }
      }
      
      throw new Error(`Ошибка сети: ${fetchError.message}`);
    }

    console.log('Ответ от n8n:', { status: response.status, statusText: response.statusText });
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        console.error('Детали ошибки n8n:', errorBody);
        errorDetails = errorBody ? ` - ${errorBody}` : '';
      } catch (e) {
        console.error('Не удалось прочитать тело ошибки:', e);
      }
      throw new Error(`Ошибка n8n: ${response.status} ${response.statusText}${errorDetails}`);
    }

    let result;
    try {
      const responseText = await response.text();
      console.log('Сырой ответ от n8n:', responseText);
      
      // Попробуем распарсить JSON ответ
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.log('Ответ не является JSON, используем как текст:', responseText);
          // Если это не JSON, используем как обычный текст
          return responseText;
        }
      } else {
        result = {};
      }
    } catch (e) {
      console.error('Ошибка парсинга JSON ответа от n8n:', e);
      throw new Error('Получен некорректный ответ от n8n');
    }

    // Обработка различных форматов ответа от n8n
    // Response hook может возвращать данные в разных форматах
    if (typeof result === 'string') {
      return result;
    }
    
    // Проверяем различные возможные поля ответа
    return result.message || 
           result.response || 
           result.text || 
           result.content ||
           result.output ||
           result.data ||
           (result.body && (result.body.message || result.body.response || result.body.text)) ||
           JSON.stringify(result) ||
           'Ответ получен от n8n';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if user can make request
    const canMake = await UsageTracker.canMakeRequest(user?.id);
    if (!canMake) {
      // Show auth modal for anonymous users, or just return for registered users
      if (!user) {
        setShowAuthModal(true);
      }
      return;
    }

    setIsLoading(true);
    setResult('');
    setSelectedCards([]);

    try {
      // Increment usage counter first
      await UsageTracker.incrementUsage(user?.id);
      
      // Refresh usage data
      await refreshUsage();

      let tarotCardNames: string[] | undefined;
      
      // Для таро-расклада выбираем случайные карты
      if (selectedService === 'tarot') {
        try {
          const allCards = await getTarotCardsList();
          if (allCards.length > 0) {
            const randomCards = selectRandomCards(allCards, 3);
            setSelectedCards(randomCards);
            tarotCardNames = randomCards.map(card => card.name);
          } else {
            console.warn('No tarot cards found in database');
          }
        } catch (error) {
          console.error('Error selecting tarot cards from database:', error);
          // Продолжаем без карт, если есть ошибка с получением карт
        }
      }

      // Send request to n8n webhook (with tarot cards if available)
      const response = await sendToN8N(selectedService, input.trim(), tarotCardNames, meowMode);
      setResult(response);
      
    } catch (error) {
      console.error('Error processing request:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при обработке запроса';
      setResult(`❌ ${errorMessage}`);
      setSelectedCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    refreshUsage(); // Refresh usage after successful auth
  };

  const handleCopyText = async () => {
    if (!result) return;
    
    try {
      // Remove HTML tags for clean text copy
      const textContent = result.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      await navigator.clipboard.writeText(textContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      const textContent = result.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  if (authLoading || !usage) {
    return (
      <section className="relative z-10 px-4 py-8 sm:py-12 lg:py-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-slate-300">Загрузка...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 animate-fade-in-slide-up">
      <div className="max-w-6xl mx-auto">
        {/* Input Panel */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`backdrop-blur-xl bg-white/50 border border-primary rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-lg shadow-primary/20 ${meowMode ? 'meow-mode-active' : ''}`}>
              {/* Мяу-режим огонек */}
              {meowMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="meow-light"></div>
                </div>
              )}
              
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-text-primary mb-4 sm:mb-6 text-center">
                Выбери, чем заняться сегодня вместе с AI-ассистентом
              </h3>
              
              {/* Тумблер Мяу-режима */}
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <Cat className={`w-5 h-5 transition-colors duration-300 ease-in-out ${meowMode ? 'text-primary' : 'text-text-secondary'}`} />
                  <span className="text-sm text-text-primary">{t('interactive.meowMode')}</span>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowMeowTooltip(true)}
                      onMouseLeave={() => setShowMeowTooltip(false)}
                      className="text-text-secondary/60 hover:text-text-secondary transition-colors duration-300 ease-in-out"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    {showMeowTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-text-primary/90 border border-text-primary/20 rounded-lg text-xs text-background whitespace-nowrap shadow-lg z-50">
                        {t('interactive.meowModeTooltip')}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary/90"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMeowMode(!meowMode);
                      setInput(''); // Очищаем поле ввода при переключении мяу-режима
                      setResult(''); // Очищаем результат
                      setSelectedCards([]); // Очищаем выбранные карты
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      meowMode ? 'bg-primary' : 'bg-text-secondary/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                        meowMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Индикатор использования */}
              <div className="mb-4 sm:mb-6">
                <UsageIndicator 
                  usage={usage}
                  remaining={remaining}
                  onAuthClick={() => setShowAuthModal(true)}
                />
              </div>
              
              {/* Service Selection Buttons */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {services.map((service) => {
                  const Icon = service.icon;
                  
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(service.id);
                        setInput('');
                        setResult('');
                        setSelectedCards([]);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 ${
                        selectedService === service.id
                          ? `bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30`
                          : `bg-gradient-to-br from-secondary to-secondary-dark text-text-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white`
                      }`}
                    >
                      {typeof service.icon === 'string' ? (
                        <img src={service.icon} alt="" className="w-4 h-4" />
                      ) : (
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span>{t(service.titleKey)}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="space-y-4">
                <p className="text-text-secondary text-center text-xs sm:text-sm mb-4 px-2">
                  {t(currentService.descriptionKey)}
                </p>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t(currentService.placeholderKey)}
                  className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-border rounded-lg text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-primary backdrop-blur-sm text-sm sm:text-base transition-colors duration-300 ease-in-out"
                  disabled={isLoading}
                />
                
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || remaining === 0}
                  className="relative w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl shadow-primary/30 flex items-center justify-center space-x-2 overflow-hidden group"
                >
                  {/* Звёздная пыль эффект */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-3 left-8 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-6 left-1/3 w-0.5 h-0.5 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-4 right-4 w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 right-8 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute bottom-6 left-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                    <div className="absolute top-3 right-1/3 w-0.5 h-0.5 bg-rose-300 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
                    <div className="absolute bottom-2 right-12 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '1.8s' }}></div>
                    <div className="absolute top-5 left-12 w-0.5 h-0.5 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>
                        {(() => {
                          const loadingMessages = t('interactive.buttons.loadingMessages');
                          const messages = Array.isArray(loadingMessages) ? loadingMessages : [t('interactive.buttons.loading')];
                          return messages[currentLoadingMessageIndex] || t('interactive.buttons.loading');
                        })()}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>
                        {remaining > 0 ? t('interactive.buttons.submit') : (usage.isAnonymous ? t('interactive.buttons.register') : t('interactive.buttons.limitReached'))}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Results */}
          {(isLoading || result || selectedCards.length > 0) && (
            <div className="mt-6 sm:mt-8 bg-white border border-primary rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg shadow-primary/20">
              <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">{t('interactive.results.title')}</h4>
              
              {/* Отображение выбранных карт таро */}
              {selectedCards.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-md font-medium text-primary mb-3">{t('interactive.results.selectedCards')}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedCards.map((card, index) => (
                      <div 
                        key={card.name} 
                        className="text-center animate-card-fade-in-slide-up"
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        <div className="relative group">
                          <img
                            src={card.imageUrl}
                            alt={card.displayName}
                            className="w-full max-w-[250px] mx-auto rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl"
                            onError={(e) => {
                              // Fallback если изображение не загрузилось
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/200x350/4c1d95/ffffff?text=${encodeURIComponent(card.displayName)}`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-text-primary/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <p className="text-xs sm:text-sm text-text-secondary mt-2 font-medium">
                          {card.displayName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded w-3/4 animate-pulse"></div>
                </div>
              ) : result && (
                <>
                  <div 
                    className="leading-relaxed text-sm sm:text-base prose max-w-none text-black"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                  
                  {/* Кнопка копирования текста внизу сообщения */}
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleCopyText}
                      className="px-4 py-2 bg-white/50 hover:bg-white/80 border border-primary/30 rounded-lg text-text-primary hover:text-text-primary/90 transition-all duration-200 flex items-center space-x-2 text-sm"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">{t('interactive.buttons.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{t('interactive.buttons.copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Модальное окно аутентификации */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
};