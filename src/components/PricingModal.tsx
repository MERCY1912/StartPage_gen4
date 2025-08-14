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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">Премиум-доступ</h2>
          <button onClick={onClose} className="rounded-xl bg-gray-100 px-3 py-1">Закрыть</button>
        </div>

        {profile && (
          <div className="mb-5 rounded-xl bg-pink-50 p-3 text-sm">
            Текущий план: <b>{profile.plan || 'free'}</b>. Лимит: <b>{profile.daily_limit ?? 0}</b> в день.
            Сегодня израсходовано: <b>{profile.used_today ?? 0}</b>.
            {profile.sub_expires_at && <> Подписка до <b>{new Date(profile.sub_expires_at).toLocaleDateString()}</b>.</>}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border p-5">
              <div className="mb-2 text-lg font-semibold">{plan.name}</div>
              <div className="mb-3 text-3xl font-bold">{plan.price_cents / 100} ₽</div>
              <ul className="mb-4 list-disc pl-5 text-sm text-gray-600">
                <li>лимит {plan.daily_limit}/день</li>
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
                className="w-full rounded-2xl bg-pink-500 px-4 py-2 font-medium text-white disabled:opacity-60"
              >
                {busy === plan.id ? 'Создаю оплату…' : `Купить ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Оплата через FreeKassa. Подписка применяется автоматически после оплаты (через серверный вебхук).
        </p>
      </div>
    </div>
  );
}
