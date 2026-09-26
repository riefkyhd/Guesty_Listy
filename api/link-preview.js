// api/link-preview.js
// Vercel Serverless Function & Node handler: Scrapes OpenGraph metadata for WhatsApp link preview
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Simple in-memory cache to prevent repeated scrapes
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function fetchUrl(targetUrl, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error('Too many redirects'));

    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(
        targetUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WhatsApp/2.23; +https://www.whatsapp.com/) AppleWebKit/537.36'
          },
          timeout: 4000
        },
        res => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, targetUrl).toString();
            return resolve(fetchUrl(redirectUrl, maxRedirects - 1));
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP status ${res.statusCode}`));
          }

          let data = '';
          res.setEncoding('utf8');
          res.on('data', chunk => {
            data += chunk;
            // Limit payload size to first 120KB for performance
            if (data.length > 120000) {
              req.destroy();
              resolve(data);
            }
          });
          res.on('end', () => resolve(data));
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
      req.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .trim();
}

function parseOpenGraph(html, targetUrl) {
  const meta = {
    url: targetUrl,
    title: '',
    description: '',
    image: '',
    siteName: ''
  };

  try {
    const parsed = new URL(targetUrl);
    meta.siteName = parsed.hostname.replace(/^www\./, '');
  } catch (e) {}

  // Match title
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (ogTitleMatch) {
    meta.title = decodeHtmlEntities(ogTitleMatch[1]);
  } else {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) meta.title = decodeHtmlEntities(titleMatch[1]);
  }

  // Match description
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
                      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (ogDescMatch) meta.description = decodeHtmlEntities(ogDescMatch[1]);

  // Match image
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImageMatch) {
    let imgUrl = ogImageMatch[1];
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
    else if (imgUrl.startsWith('/')) {
      try {
        const parsed = new URL(targetUrl);
        imgUrl = `${parsed.protocol}//${parsed.host}${imgUrl}`;
      } catch (e) {}
    }
    meta.image = imgUrl;
  }

  // Site name
  const ogSiteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  if (ogSiteMatch) meta.siteName = decodeHtmlEntities(ogSiteMatch[1]);

  return meta;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Get target url from query or params
  const targetUrl = (req.query && req.query.url) || 
                    (new URL(req.url, 'http://localhost').searchParams.get('url'));

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing "url" parameter' });
  }

  // Check cache
  const cached = cache.get(targetUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    const html = await fetchUrl(targetUrl);
    const meta = parseOpenGraph(html, targetUrl);

    // If no title found, fallback to URL host
    if (!meta.title) {
      meta.title = meta.siteName || targetUrl;
    }

    cache.set(targetUrl, { timestamp: Date.now(), data: meta });
    return res.status(200).json(meta);
  } catch (err) {
    // Graceful fallback for preview without failing
    const parsed = new URL(targetUrl);
    const fallbackMeta = {
      url: targetUrl,
      title: parsed.hostname,
      description: 'Undangan Pernikahan Online',
      image: '',
      siteName: parsed.hostname
    };
    return res.status(200).json(fallbackMeta);
  }
};
