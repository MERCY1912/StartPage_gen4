import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { startPurchase } from '../lib/payments';

type Plan = {
  id: string;
  name: string;
  price_cents: number;
  period_days: number;
  daily_limit: number;
};

type Props = { open: boolean; onClose: () => void };

const badges: { [key: number]: { text: string; className: string } } = {
  1: { text: 'попробовать', className: 'bg-secondary/50 text-text-primary' },
  7: { text: 'выгодно', className: 'bg-primary/80 text-text-primary' },
  30: { text: 'лучший выбор', className: 'bg-accent-vibrant text-white' },
};

export default function PricingModal({ open, onClose }: Props) {
  const [profile, setProfile] = useState<null | {
    plan: string | null;
    daily_limit: number | null;
    used_today: number | null;
    sub_expires_at: string | null;
  }>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('plan,daily_limit,used_today,sub_expires_at')
          .eq('user_id', user.id)
          .single();
        setProfile(data ?? null);
      } else {
        setProfile(null);
      }

      const { data: plansData } = await supabase
        .from('plans')
        .select('id,name,price_cents,period_days,daily_limit')
        .order('period_days', { ascending: true });
      setPlans(plansData ?? []);
    })();
  }, [open]);

  if (!open) return null;

  // Assuming 3 plans, we can highlight the last one.
  const highlightedPlanIndex = plans.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in-slide-up">
      <div className="w-full max-w-4xl rounded-3xl bg-background border border-border p-8 shadow-glow-purple text-text-primary font-sans">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-3xl font-serif font-semibold text-text-primary">Премиум-доступ</h2>
          <button onClick={onClose} className="rounded-full hover:bg-secondary/50 transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {profile && (
          <div className="mb-6 rounded-xl bg-secondary/20 border border-secondary/30 p-4 text-sm">
            Текущий план: <b className="font-semibold">{profile.plan || 'free'}</b>. Лимит: <b className="font-semibold">{profile.daily_limit ?? 0}</b> в день.
            Сегодня израсходовано: <b className="font-semibold">{profile.used_today ?? 0}</b>.
            {profile.sub_expires_at && <> Подписка до <b className="font-semibold">{new Date(profile.sub_expires_at).toLocaleDateString()}</b>.</>}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const badge = badges[plan.period_days];
            const isHighlighted = index === highlightedPlanIndex;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 transition-all duration-300 transform hover:-translate-y-1 ${
                  isHighlighted
                    ? 'bg-white/60 border-accent shadow-glow scale-105'
                    : 'bg-white/40 border-border'
                }`}
              >
                {badge && (
                  <div
                    className={`absolute -top-3 right-4 px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${badge.className}`}
                  >
                    {badge.text}
                  </div>
                )}
                <div className="mb-2 text-xl font-semibold font-serif">{plan.name}</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price_cents / 100}</span>
                  <span className="text-text-secondary"> ₽</span>
                </div>
                <ul className="mb-5 space-y-2 list-inside list-disc text-sm text-text-secondary">
                  <li>Лимит {plan.daily_limit} генераций/день</li>
                  <li>Приоритет в очереди</li>
                  <li>Поддержка проекта</li>
                </ul>
                <button
                  disabled={!!busy}
                  onClick={async () => {
                    try {
                      setBusy(plan.id);
                      await startPurchase(plan.id);
                    } finally {
                      setBusy(null);
                    }
                  }}
                  className={`w-full rounded-xl py-3 font-medium text-white transition-all duration-300 disabled:opacity-60 transform hover:scale-105 ${
                    isHighlighted
                      ? 'bg-accent-vibrant hover:bg-rose-600 shadow-lg'
                      : 'bg-accent hover:bg-accent-vibrant'
                  }`}
                >
                  {busy === plan.id ? 'Создаю оплату…' : `Купить ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-text-secondary">
          Оплата через FreeKassa. Подписка применяется автоматически после оплаты (через серверный вебхук).
        </p>
      </div>
    </div>
  );
}
