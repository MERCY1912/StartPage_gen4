import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import PricingModal from '../components/PricingModal';

export default function Account() {
  const [p, setP] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setP(null); return; }
      const { data } = await supabase
        .from('profiles')
        .select('plan,daily_limit,used_today,sub_expires_at')
        .eq('user_id', user.id)
        .single();
      setP(data ?? null);
    })();
  }, []);

  if (p === null) {
    return (
      <div className="mx-auto mt-24 max-w-xl rounded-2xl border p-6 text-center">
        <h1 className="mb-2 text-xl font-semibold">Аккаунт</h1>
        <p>Войдите, чтобы посмотреть статус подписки.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-24 max-w-xl rounded-2xl border p-6">
      <h1 className="mb-4 text-xl font-semibold">Аккаунт</h1>
      <div className="rounded-xl bg-pink-50 p-4">
        <div>План: <b>{p.plan}</b></div>
        <div>Лимит в день: <b>{p.daily_limit}</b></div>
        <div>Использовано сегодня: <b>{p.used_today}</b></div>
        {p.sub_expires_at && <div>Действует до: <b>{new Date(p.sub_expires_at).toLocaleString()}</b></div>}
      </div>
      <button onClick={() => setOpen(true)} className="mt-4 w-full rounded-2xl bg-pink-500 px-4 py-2 text-white">
        Продлить / купить подписку
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
