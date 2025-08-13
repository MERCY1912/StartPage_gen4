import { useEffect, useState } from 'react';
import AccountModal from './AccountModal';
import { supabase } from '../supabaseClient';

export default function HeaderAccountButton({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRemaining(null); return; }
      const { data } = await supabase
        .from('profiles')
        .select('daily_limit,used_today')
        .eq('user_id', user.id).single();
      if (data) setRemaining(Math.max(0, (data.daily_limit ?? 0) - (data.used_today ?? 0)));
    })();
  }, []);

  return (
    <>
      {remaining !== null && (
        <span className="mr-3 hidden text-sm text-gray-600 md:inline">
          Осталось: <b>{remaining}</b>
        </span>
      )}
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-pink-500 px-4 py-2 text-white"
      >
        Аккаунт
      </button>
      <AccountModal open={open} onClose={() => setOpen(false)} onOpenAuth={onOpenAuth} />
    </>
  );
}
