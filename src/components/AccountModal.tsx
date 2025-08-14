import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../supabaseClient';
import PricingModal from './PricingModal';
import { X, User, LogOut, CreditCard, ShoppingCart, Loader2, Star, ShieldCheck } from 'lucide-react';

type Profile = {
  plan: string | null;
  daily_limit: number | null;
  used_today: number | null;
  sub_expires_at: string | null;
};
type Payment = {
  id: number;
  provider: string | null;
  plan_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
};
type Plan = { id: string; name: string };

export default function AccountModal({
  open,
  onClose,
  onOpenAuth,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plansMap, setPlansMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user) {
        const [p1, p2, p3] = await Promise.all([
          supabase.from('profiles').select('plan,daily_limit,used_today,sub_expires_at').eq('user_id', user.id).single(),
          supabase.from('payments').select('id,provider,plan_id,amount_cents,currency,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('plans').select('id,name')
        ]);
        setProfile(p1.data ?? null);
        setPayments(p2.data ?? []);
        const map: Record<string, string> = {};
        (p3.data ?? []).forEach((pl: Plan) => { map[pl.id] = pl.name; });
        setPlansMap(map);
      } else {
        setProfile(null);
        setPayments([]);
      }
      setLoading(false);
    })();
  }, [open]);

  const remaining = useMemo(() => {
    const d = profile?.daily_limit ?? 0;
    const u = profile?.used_today ?? 0;
    return Math.max(0, d - u);
  }, [profile]);

  if (!open) return null;

  const active = profile?.sub_expires_at ? new Date(profile.sub_expires_at) > new Date() : false;

  const money = (cents?: number | null, cur = 'RUB') =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur }).format(((cents ?? 0) / 100));

  const dateTime = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl backdrop-blur-xl bg-background/90 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/20 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-text-primary">Мой аккаунт</h2>
                <p className="text-sm text-text-secondary">{email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {!loading && !email && (
            <div className="text-center py-12">
              <p className="mb-4 text-text-secondary">Для доступа к аккаунту необходимо войти.</p>
              <button onClick={onOpenAuth} className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl shadow-primary/30">
                Войти / Зарегистрироваться
              </button>
            </div>
          )}

          {!loading && email && (
            <div className="space-y-6">
              {/* Profile Block */}
              <div className="bg-white/60 border border-border rounded-xl p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-3">
                  <InfoCard title="План" value={profile?.plan ?? 'free'} icon={<Star className="w-5 h-5 text-primary"/>} />
                  <InfoCard title="Лимит в день" value={String(profile?.daily_limit ?? 0)} icon={<ShieldCheck className="w-5 h-5 text-green-500"/>} />
                  <InfoCard title="Израсходовано" value={String(profile?.used_today ?? 0)} icon={<CreditCard className="w-5 h-5 text-orange-500"/>} />
                </div>
                <div className="mt-6">
                  <UsageBar value={(profile?.used_today ?? 0)} max={(profile?.daily_limit ?? 0)} />
                  <div className="mt-2 text-sm text-text-secondary text-right">
                    Осталось сегодня: <b>{remaining}</b>
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div className={`rounded-xl p-4 flex items-center gap-4 ${active ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                {active ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <ShoppingCart className="w-6 h-6 text-amber-500" />}
                <div>
                  <p className={`font-semibold ${active ? 'text-green-700' : 'text-amber-700'}`}>
                    {active ? `Подписка активна до ${dateTime(profile?.sub_expires_at)}` : "Подписка не активна"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {active
                      ? "Спасибо за вашу поддержку! 💗"
                      : <button className="text-accent hover:underline" onClick={()=>setShowPricing(true)}>Купить или продлить подписку</button>
                    }
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-serif font-bold text-text-primary mb-3">Последние платежи</h3>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border bg-white/60">
                    <table className="min-w-full text-sm">
                      <thead className="bg-white/80">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-text-primary">Дата</th>
                          <th className="px-4 py-3 text-left font-semibold text-text-primary">План</th>
                          <th className="px-4 py-3 text-left font-semibold text-text-primary">Сумма</th>
                          <th className="px-4 py-3 text-left font-semibold text-text-primary">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.map(p => (
                          <tr key={p.id} className="hover:bg-primary/10 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-text-secondary">{dateTime(p.created_at)}</td>
                            <td className="px-4 py-3 text-text-primary font-medium">{plansMap[p.plan_id || ''] || p.plan_id || '—'}</td>
                            <td className="px-4 py-3 text-text-primary">{money(p.amount_cents, p.currency || 'RUB')}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                p.status === 'paid' ? 'bg-green-100 text-green-800'
                                : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-text-secondary">Платежей пока нет.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!loading && email && (
          <div className="p-6 border-t border-border bg-background/80 flex justify-end items-center gap-4">
            <button onClick={async () => { await supabase.auth.signOut(); onClose(); }} className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-accent transition-colors rounded-full font-medium">
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
            <button onClick={() => setShowPricing(true)} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl shadow-primary/30">
              <ShoppingCart className="w-4 h-4" />
              Тарифы
            </button>
          </div>
        )}
      </div>
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>,
    document.getElementById('modal-root')!
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-background/50 border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-sm text-text-secondary">{title}</div>
        <div className="text-lg font-bold text-text-primary">{value}</div>
      </div>
    </div>
  );
}

function UsageBar({ value, max }: { value: number; max: number }) {
  const percent = Math.min(100, Math.round((max > 0 ? value / max : 0) * 100));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
        style={{ width: `${percent}%` }}
        aria-label={`Использовано ${percent}%`}
      />
    </div>
  );
}
