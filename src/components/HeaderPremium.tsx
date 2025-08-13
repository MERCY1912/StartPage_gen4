import PricingModal from '../components/PricingModal';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function HeaderPremium() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRemaining(null); return; }
      const { data } = await supabase
        .from('profiles')
        .select('daily_limit,used_today')
        .eq('user_id', user.id)
        .single();
      if (data) setRemaining(Math.max(0, data.daily_limit - data.used_today));
    })();
  }, []);

  return (
    <>
      {remaining !== null && (
        <span className="mr-3 text-sm text-gray-600">Осталось сегодня: <b>{remaining}</b></span>
      )}
      <button onClick={() => setOpen(true)} className="rounded-xl bg-pink-500 px-4 py-2 text-white">
        Премиум
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
