import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import PricingModal from './PricingModal';

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
  onOpenAuth, // опционально: открыть твою модалку логина/регистрации
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
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user) {
        const [p1, p2, p3] = await Promise.all([
          supabase.from('profiles')
            .select('plan,daily_limit,used_today,sub_expires_at')
            .eq('user_id', user.id).single(),
          supabase.from('payments')
            .select('id,provider,plan_id,amount_cents,currency,status,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
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

  const active = profile?.sub_expires_at
    ? new Date(profile.sub_expires_at) > new Date()
    : false;

  const money = (cents?: number | null, cur = 'RUB') =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur })
      .format(((cents ?? 0) / 100));

  const dateTime = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('ru-RU') : '—';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">Аккаунт</h2>
          <button onClick={onClose} className="rounded-xl bg-gray-100 px-3 py-1">Закрыть</button>
        </div>

        {!email && (
          <div className="rounded-2xl border p-6 text-center">
            <p className="mb-3">Вы не вошли в аккаунт.</p>
            <button
              onClick={onOpenAuth}
              className="rounded-2xl bg-pink-500 px-4 py-2 text-white"
            >
              Войти / Зарегистрироваться
            </button>
          </div>
        )}

        {email && (
          <>
            {/* Блок профиля */}
            <div className="mb-6 rounded-2xl border p-6">
              <div className="mb-1 text-sm text-gray-500">Почта</div>
              <div className="mb-4 font-medium">{email}</div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard title="План" value={profile?.plan ?? 'free'} />
                <InfoCard title="Лимит в день" value={String(profile?.daily_limit ?? 0)} />
                <InfoCard title="Сегодня израсходовано" value={String(profile?.used_today ?? 0)} />
              </div>

              <div className="mt-4">
                <UsageBar value={(profile?.used_today ?? 0)} max={(profile?.daily_limit ?? 0)} />
                <div className="mt-1 text-sm text-gray-600">
                  Осталось сегодня: <b>{remaining}</b>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-pink-50 p-3 text-sm">
                {active ? (
                  <>Подписка активна до <b>{dateTime(profile?.sub_expires_at)}</b> — спасибо за поддержку! 💗</>
                ) : (
                  <>Подписка не активна. <button className="text-pink-600 underline" onClick={()=>setShowPricing(true)}>Купить / продлить</button></>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPricing(true)}
                  className="rounded-2xl bg-pink-500 px-4 py-2 text-white"
                >
                  Продлить / купить
                </button>
                <button
                  onClick={async () => { await supabase.auth.signOut(); onClose(); }}
                  className="rounded-2xl bg-gray-200 px-4 py-2"
                >
                  Выйти
                </button>
              </div>
            </div>

            {/* История платежей (последние 5) */}
            <div className="rounded-2xl border p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Последние платежи</h3>
                <a href="/account" className="text-sm text-pink-600 underline">вся история</a>
              </div>

              {loading && <div className="text-sm text-gray-500">Загрузка…</div>}
              {!loading && payments.length === 0 && (
                <div className="text-sm text-gray-500">Платежей пока нет.</div>
              )}

              {!loading && payments.length > 0 && (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2">Дата</th>
                        <th className="px-3 py-2">План</th>
                        <th className="px-3 py-2">Сумма</th>
                        <th className="px-3 py-2">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap">{dateTime(p.created_at)}</td>
                          <td className="px-3 py-2">{plansMap[p.plan_id || ''] || p.plan_id || '—'}</td>
                          <td className="px-3 py-2">{money(p.amount_cents, p.currency || 'RUB')}</td>
                          <td className="px-3 py-2">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                              p.status === 'paid' ? 'bg-green-100 text-green-700'
                              : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function UsageBar({ value, max }: { value: number; max: number }) {
  const percent = Math.min(100, Math.round((max > 0 ? value / max : 0) * 100));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full bg-pink-500 transition-all"
        style={{ width: `${percent}%` }}
        aria-label={`Использовано ${percent}%`}
      />
    </div>
  );
}
