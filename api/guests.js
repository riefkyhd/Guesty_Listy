// api/guests.js
// Vercel Serverless Function: Manage guest list in Supabase
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const supabase = getSupabase();

  // GET /api/guests — fetch all stored guests
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('guests')
      .select('row_index, raw_data')
      .order('row_index', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ guests: data });
  }

  // POST /api/guests — replace entire guest list with new parsed rows, and optionally update sent statuses atomically
  if (req.method === 'POST') {
    const { rows, sentStatuses, rsvpStatuses } = req.body || {};
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'rows array required' });
    }

    // Filter out any blank/empty rows before inserting
    const cleanRows = rows.filter(r => {
      if (!r || typeof r !== 'object') return false;
      const name = (r.Nama || r.Name || r.name || '').toString().trim();
      return name.length > 0 && name.toLowerCase() !== 'undefined';
    });

    // Delete existing guests and replace
    await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (cleanRows.length > 0) {
      const insertData = cleanRows.map((raw_data, row_index) => ({ row_index, raw_data }));
      const { error } = await supabase.from('guests').insert(insertData);
      if (error) return res.status(500).json({ error: error.message });
    }

    // If sentStatuses provided, sync sent_statuses atomically in the same operation
    if (sentStatuses && typeof sentStatuses === 'object') {
      const activeKeys = Object.keys(sentStatuses).filter(k => sentStatuses[k]);
      if (activeKeys.length > 0) {
        const upsertData = activeKeys.map(guest_key => ({
          guest_key,
          is_sent: true,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('sent_statuses').upsert(upsertData, { onConflict: 'guest_key' });
      }
    }

    // If rsvpStatuses provided, sync rsvp_statuses atomically in the same operation
    if (rsvpStatuses && typeof rsvpStatuses === 'object') {
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
        await supabase.from('rsvp_statuses').upsert(upsertData, { onConflict: 'guest_key' });
      }
    }

    // Explicitly delete only specified keys (e.g. when a guest row is intentionally deleted)
    if (Array.isArray(req.body.deletedGuestKeys) && req.body.deletedGuestKeys.length > 0) {
      await supabase.from('sent_statuses').delete().in('guest_key', req.body.deletedGuestKeys);
      await supabase.from('rsvp_statuses').delete().in('guest_key', req.body.deletedGuestKeys);
    }

    return res.status(200).json({ ok: true, count: rows.length });
  }

  // DELETE /api/guests — clear all guests
  if (req.method === 'DELETE') {
    await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
