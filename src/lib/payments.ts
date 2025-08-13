import { supabase } from '../supabaseClient';

export async function startPurchase(planId: 'sub_7d' | 'sub_30d') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Требуется вход');

  const res = await fetch('/.netlify/functions/billing-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ plan_id: planId }),
  });

  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out?.url) {
    throw new Error(out?.error || 'Не удалось создать ссылку оплаты');
  }
  window.location.href = out.url; // редирект на FreeKassa
}
