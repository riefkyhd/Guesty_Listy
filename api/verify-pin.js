// api/verify-pin.js
// Vercel Serverless Function: Validates access PIN
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pin } = req.body || {};
  const APP_PIN = process.env.APP_PIN || '36032';

  if (!pin) {
    return res.status(400).json({ ok: false, error: 'PIN required' });
  }

  if (String(pin).trim() === String(APP_PIN).trim()) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: 'Invalid PIN' });
};
