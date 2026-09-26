// api/templates.js
// Vercel Serverless Function: Get/save custom message template in Supabase
const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const TEMPLATE_KEY = 'custom_template';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const supabase = getSupabase();

  // GET /api/templates — return saved custom template
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', TEMPLATE_KEY)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ template: data?.value?.text || null });
  }

  // POST /api/templates — save custom template
  // Body: { template: string }
  if (req.method === 'POST') {
    const { template } = req.body || {};
    if (typeof template !== 'string') {
      return res.status(400).json({ error: 'template string required' });
    }

    const { error } = await supabase.from('settings').upsert({
      key: TEMPLATE_KEY,
      value: { text: template },
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
