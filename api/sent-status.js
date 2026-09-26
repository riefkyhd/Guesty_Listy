// api/sent-status.js
// Vercel Serverless Function: Manage sent statuses in Supabase
const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const supabase = getSupabase();

  // GET /api/sent-status — return all sent statuses as { guestKey: boolean }
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('sent_statuses')
      .select('guest_key, is_sent');

    if (error) return res.status(500).json({ error: error.message });

    const result = {};
    (data || []).forEach(row => {
      if (row.is_sent) result[row.guest_key] = true;
    });
    return res.status(200).json({ sentStatuses: result });
  }

  // POST /api/sent-status — upsert a single status
  // Body: { guestKey: string, isSent: boolean }
  if (req.method === 'POST') {
    const { guestKey, isSent } = req.body || {};
    if (!guestKey) return res.status(400).json({ error: 'guestKey required' });

    if (isSent) {
      const { error } = await supabase.from('sent_statuses').upsert({
        guest_key: guestKey,
        is_sent: true,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'guest_key' });
      if (error) return res.status(500).json({ error: error.message });
    } else {
      const { error } = await supabase.from('sent_statuses').upsert({
        guest_key: guestKey,
        is_sent: false,
        sent_at: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'guest_key' });
      if (error) return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  // DELETE /api/sent-status — reset all statuses
  if (req.method === 'DELETE') {
    const { error } = await supabase.from('sent_statuses').delete().neq('guest_key', '__none__');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
