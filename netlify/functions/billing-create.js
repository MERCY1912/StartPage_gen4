const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { plan_id } = JSON.parse(event.body || '{}');
    const token = event.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return { statusCode: 401, body: 'Unauthorized' };

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return { statusCode: 401, body: 'Unauthorized' };

    const { data: plan, error: planErr } =
      await supabase.from('plans').select('*').eq('id', plan_id).single();
    if (planErr || !plan) return { statusCode: 404, body: 'Plan not found' };

    const merchantId = process.env.FK_MERCHANT_ID;
    const secret1   = process.env.FK_SECRET_WORD1;
    const orderId   = `${user.id}-${Date.now()}`;
    const amount    = (plan.price_cents / 100).toFixed(2);
    const currency  = plan.currency;

    const sign = crypto.createHash('md5')
      .update(`${merchantId}:${amount}:${secret1}:${currency}:${orderId}`)
      .digest('hex');

    const payUrl = new URL('https://pay.fk.money/');
    payUrl.searchParams.set('m', merchantId);
    payUrl.searchParams.set('oa', amount);
    payUrl.searchParams.set('o', orderId);
    payUrl.searchParams.set('s', sign);
    payUrl.searchParams.set('currency', currency);

    await supabase.from('payments').insert({
      user_id: user.id,
      provider: 'freekassa',
      provider_order_id: orderId,
      plan_id: plan.id,
      amount_cents: plan.price_cents,
      currency,
      status: 'pending'
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: payUrl.toString() })
    };
  } catch (e) {
    console.error('[billing-create]', e);
    return { statusCode: 500, body: 'Server error' };
  }
};
