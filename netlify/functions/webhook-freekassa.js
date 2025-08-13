const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const params = new URLSearchParams(event.body || '');
    const MERCHANT_ID       = params.get('MERCHANT_ID') || '';
    const AMOUNT            = params.get('AMOUNT') || '';
    const MERCHANT_ORDER_ID = params.get('MERCHANT_ORDER_ID') || '';
    const SIGN              = (params.get('SIGN') || '').toLowerCase();

    // md5(MERCHANT_ID:AMOUNT:SECRET2:MERCHANT_ORDER_ID)
    const check = crypto.createHash('md5')
      .update(`${MERCHANT_ID}:${AMOUNT}:${process.env.FK_SECRET_WORD2}:${MERCHANT_ORDER_ID}`)
      .digest('hex');
    if (SIGN !== check) return { statusCode: 400, body: 'bad sign' };

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: payment } = await supabase.from('payments').select('*')
      .eq('provider', 'freekassa')
      .eq('provider_order_id', MERCHANT_ORDER_ID)
      .single();
    if (!payment) return { statusCode: 404, body: 'payment not found' };

    if (payment.status !== 'paid') {
      await supabase.from('payments')
        .update({ status: 'paid', raw_payload: Object.fromEntries(params) })
        .eq('id', payment.id);

      if (payment.plan_id) {
        await supabase.rpc('apply_subscription_by_plan', {
          p_user_id: payment.user_id,
          p_plan_id: payment.plan_id
        });
      }
    }
    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    console.error('[webhook-freekassa]', e);
    return { statusCode: 500, body: 'Server error' };
  }
};
