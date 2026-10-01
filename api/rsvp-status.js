// api/rsvp-status.js
// Vercel Serverless Function: Manage guest RSVP statuses in Supabase
const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = (process.env.SUPABASE_URL && process.env.SUPABASE_URL.startsWith('http'))
    ? process.env.SUPABASE_URL
    : 'https://frsovtlwvantrzjojfzs.supabase.co';
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== '[SENSITIVE]')
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== '[SENSITIVE]')
    ? process.env.SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc292dGx3dmFudHJ6am9qZnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzE5NzgsImV4cCI6MjEwNjAwNzk3OH0.EWUtDbimDb_SXN2rcqpZxclNp3yYBK-maW0fWQIb__8';
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const supabase = getSupabase();

  // GET /api/rsvp-status — return all rsvp statuses as { [guestKey]: status }
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('rsvp_statuses')
      .select('guest_key, status');

    if (error) return res.status(500).json({ error: error.message });

    const result = {};
    (data || []).forEach(row => {
      if (row.status && row.status !== 'pending') {
        result[row.guest_key] = row.status;
      }
    });
    return res.status(200).json({ rsvpStatuses: result });
  }

  // POST /api/rsvp-status — upsert a single RSVP status
  // Body: { guestKey: string, status: 'pending' | 'attending' | 'declined' | 'maybe' }
  if (req.method === 'POST') {
    const { guestKey, status } = req.body || {};
    if (!guestKey) return res.status(400).json({ error: 'guestKey required' });

    const validStatus = ['pending', 'attending', 'declined', 'maybe'].includes(status) ? status : 'pending';

    if (validStatus === 'pending') {
      // Delete or set to pending
      await supabase.from('rsvp_statuses').delete().eq('guest_key', guestKey);
    } else {
      const { error } = await supabase.from('rsvp_statuses').upsert({
        guest_key: guestKey,
        status: validStatus,
        updated_at: new Date().toISOString()
      }, { onConflict: 'guest_key' });
      if (error) return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  // PUT /api/rsvp-status — batch upsert statuses
  // Body: { rsvpStatuses: { [key]: status } }
  if (req.method === 'PUT') {
    const { rsvpStatuses } = req.body || {};
    if (!rsvpStatuses || typeof rsvpStatuses !== 'object') {
      return res.status(400).json({ error: 'rsvpStatuses object required' });
    }

    const nonPendingKeys = Object.keys(rsvpStatuses).filter(k => {
      const s = rsvpStatuses[k];
      return ['attending', 'declined', 'maybe'].includes(s);
    });

    if (nonPendingKeys.length > 0) {
      const upsertData = nonPendingKeys.map(guest_key => ({
        guest_key,
        status: rsvpStatuses[guest_key],
        updated_at: new Date().toISOString()
      }));
      const { error: upsertErr } = await supabase.from('rsvp_statuses').upsert(upsertData, { onConflict: 'guest_key' });
      if (upsertErr) return res.status(500).json({ error: upsertErr.message });
    }

    // Clean up obsolete keys
    const { data: existingData } = await supabase.from('rsvp_statuses').select('guest_key');
    const activeSet = new Set(nonPendingKeys);
    const toDelete = (existingData || []).map(r => r.guest_key).filter(k => !activeSet.has(k));
    if (toDelete.length > 0) {
      const { error: delErr } = await supabase.from('rsvp_statuses').delete().in('guest_key', toDelete);
      if (delErr) return res.status(500).json({ error: delErr.message });
    }

    return res.status(200).json({ ok: true, count: nonPendingKeys.length });
  }

  // DELETE /api/rsvp-status — reset all RSVP statuses
  if (req.method === 'DELETE') {
    const { error } = await supabase.from('rsvp_statuses').delete().neq('guest_key', '__never__');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
