// api/logs.js
// Vercel Serverless Function: Manage Activity Logs in Supabase
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

function parseUserAgent(ua = '') {
  if (!ua) return 'Perangkat Tidak Dikenal';

  let os = 'Unknown OS';
  if (/iPhone/i.test(ua)) os = 'iPhone';
  else if (/iPad/i.test(ua)) os = 'iPad';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Mac';
  else if (/Windows NT/i.test(ua)) os = 'Windows PC';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  return `${os} • ${browser}`;
}

function getLocation(req) {
  const city = req.headers['x-vercel-ip-city'];
  const country = req.headers['x-vercel-ip-country'];
  const region = req.headers['x-vercel-ip-country-region'];

  if (city && country) {
    const cityName = decodeURIComponent(city);
    return country === 'ID' ? `${cityName}, Indonesia` : `${cityName}, ${country}`;
  }
  if (country) {
    return country === 'ID' ? 'Indonesia' : country;
  }
  return 'Lokal / Tidak Terdeteksi';
}

function getIpAddress(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const supabase = getSupabase();

  // GET /api/logs — retrieve recent 50 activity logs
  if (req.method === 'GET') {
    const limit = Math.min(parseInt(req.query?.limit || '50', 10), 100);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ logs: data || [] });
  }

  // POST /api/logs — record a new activity
  if (req.method === 'POST') {
    const { action, summary, details, clientDeviceInfo } = req.body || {};
    if (!action || !summary) {
      return res.status(400).json({ error: 'action and summary are required' });
    }

    const ua = req.headers['user-agent'] || '';
    const deviceInfo = clientDeviceInfo || parseUserAgent(ua);
    const ipAddress = getIpAddress(req);
    const location = getLocation(req);

    const newLog = {
      action,
      summary,
      details: details || {},
      device_info: deviceInfo,
      ip_address: ipAddress,
      location,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activity_logs')
      .insert(newLog)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ ok: true, log: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
