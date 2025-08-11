import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../supabaseClient';
import { UsageTracker } from '../utils/usageTracker';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        if (isSignUp) {
          // For new users, migrate any anonymous usage
          // We'll get the user ID from the auth context after successful signup
          setTimeout(async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await UsageTracker.migrateAnonymousUsage(user.id);
              }
            } catch (migrationError) {
              console.error('Migration error:', migrationError);
            }
          }, 1000);
        }
        onSuccess();
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setIsSignUp(false);
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/80 border border-primary rounded-2xl p-6 shadow-2xl shadow-primary/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">
            {isSignUp ? t('auth.modal.signUp') : t('auth.modal.signIn')}
          </h2>
          <p className="text-text-secondary text-sm">
            {isSignUp 
              ? t('auth.modal.signUpDescription')
              : t('auth.modal.signInDescription')
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('auth.modal.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary/70" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg text-text-primary placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                placeholder={t('auth.modal.emailPlaceholder')}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('auth.modal.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary/70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg text-text-primary placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                placeholder={t('auth.modal.passwordPlaceholder')}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl shadow-primary/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isSignUp ? t('auth.modal.signUpLoading') : t('auth.modal.signInLoading')}</span>
              </>
            ) : (
              <span>{isSignUp ? t('auth.modal.signUpButton') : t('auth.modal.signInButton')}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-accent hover:text-primary transition-colors text-sm font-medium"
            disabled={loading}
          >
            {isSignUp 
              ? t('auth.modal.switchToSignIn')
              : t('auth.modal.switchToSignUp')
            }
          </button>
        </div>

        {isSignUp && (
          <p className="text-xs text-text-secondary text-center mt-4">
            {t('auth.modal.terms')}
          </p>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};