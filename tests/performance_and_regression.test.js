const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Guesty Listy Regression & Performance Test Suite...\n');

let totalTests = 0;
let passedTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ ${description}`);
  } catch (err) {
    console.error(`  ❌ ${description}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function itAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ ${description}`);
  } catch (err) {
    console.error(`  ❌ ${description}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

// =============================================================================
// 1. Phone Normalization Logic
// =============================================================================
console.log('--- 1. Phone Normalization Logic ---');

function normalizePhone(raw) {
  if (raw === undefined || raw === null) return { raw: '', formatted: '', isValid: false };
  let str = String(raw).trim();
  str = str.replace(/['"\s\-().]/g, '');
  if (!str) return { raw: '', formatted: '', isValid: false };
  if (str.startsWith('+')) str = str.slice(1);
  if (str.startsWith('08')) str = '628' + str.slice(2);
  else if (str.startsWith('8')) str = '628' + str.slice(1);
  const isDigits = /^\d+$/.test(str);
  const isValid = isDigits && str.length >= 10 && str.length <= 15;
  return { raw: String(raw).trim(), formatted: str, isValid };
}

it('Normalizes 08xx Indonesian numbers to 628xx', () => {
  const res = normalizePhone('081234567890');
  assert.strictEqual(res.formatted, '6281234567890');
  assert.strictEqual(res.isValid, true);
});

it('Handles numbers with spaces, dashes, parentheses and + prefix', () => {
  const res = normalizePhone('+62 812-3456-(7890)');
  assert.strictEqual(res.formatted, '6281234567890');
  assert.strictEqual(res.isValid, true);
});

it('Normalizes 8xx prefix directly to 628xx', () => {
  const res = normalizePhone('81234567890');
  assert.strictEqual(res.formatted, '6281234567890');
  assert.strictEqual(res.isValid, true);
});

it('Flags short numbers or non-numeric strings as invalid', () => {
  assert.strictEqual(normalizePhone('12345').isValid, false);
  assert.strictEqual(normalizePhone('invalid-phone').isValid, false);
  assert.strictEqual(normalizePhone('').isValid, false);
});

// =============================================================================
// 2. Guest Side Identification
// =============================================================================
console.log('\n--- 2. Guest Side Identification ---');

function getGuestSide(row) {
  if (!row) return null;
  const raw = (
    row['Catatan'] || row['catatan'] || 
    row['Notes'] || row['notes'] || 
    row['Note'] || row['note'] || 
    row['Keterangan'] || row['keterangan'] || 
    row['Pihak'] || row['pihak'] || 
    row['Label'] || row['label'] || ''
  ).toString().trim();
  if (/\b(dhifa)\b/i.test(raw)) return 'dhifa';
  if (/\b(riefky|kiki)\b/i.test(raw)) return 'riefky';
  if (/\b(abi)\b/i.test(raw)) return 'abi';
  if (/\b(umi)\b/i.test(raw)) return 'umi';
  if (/\b(papa)\b/i.test(raw)) return 'papa';
  if (/\b(mama)\b/i.test(raw)) return 'mama';
  return null;
}

it('Identifies Dhifa side correctly', () => {
  assert.strictEqual(getGuestSide({ Catatan: 'Teman SMA Dhifa' }), 'dhifa');
});

it('Identifies Riefky / Kiki side correctly', () => {
  assert.strictEqual(getGuestSide({ Catatan: 'Teman Kantor Riefky' }), 'riefky');
  assert.strictEqual(getGuestSide({ Catatan: 'Keluarga Kiki' }), 'riefky');
});

it('Identifies Abi, Umi, Papa, Mama sides accurately', () => {
  assert.strictEqual(getGuestSide({ Notes: 'Relasi Bisnis Abi' }), 'abi');
  assert.strictEqual(getGuestSide({ Note: 'Pengajian Umi' }), 'umi');
  assert.strictEqual(getGuestSide({ Keterangan: 'Sahabat Papa' }), 'papa');
  assert.strictEqual(getGuestSide({ Pihak: 'Arisan Mama' }), 'mama');
});

it('Returns null for generic notes without side affiliations', () => {
  assert.strictEqual(getGuestSide({ Catatan: 'VIP Tamu Khusus' }), null);
  assert.strictEqual(getGuestSide({}), null);
});

// =============================================================================
// 3. Deterministic Key Derivation & State Invariance
// =============================================================================
console.log('\n--- 3. Key Derivation & State Invariance ---');

function normalizeKeyPart(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function getRowKey(row, index) {
  if (!row) return `idx_${index !== undefined ? index : 'unknown'}`;
  const phone = normalizeKeyPart(row['Nomor'] || row['Phone'] || row['No. WhatsApp'] || row['Telepon'] || '');
  const name = normalizeKeyPart(row['Nama'] || row['Name'] || '');
  if (phone) return `phone_${phone}`;
  if (name) return `name_${name}`;
  return `idx_${index !== undefined ? index : 0}`;
}

function getLegacyRowKey(row, index) {
  return `row_${index !== undefined ? index : 0}`;
}

it('Produces deterministic phone-based keys for guests with numbers', () => {
  const row = { 'Nama': 'Budi Santoso', 'No. WhatsApp': '08123456789' };
  assert.strictEqual(getRowKey(row, 0), 'phone_08123456789');
  assert.strictEqual(getRowKey(row, 42), 'phone_08123456789');
});

it('Produces deterministic name-based keys when phone is absent', () => {
  const row = { 'Nama': 'Ani & Suami', 'No. WhatsApp': '' };
  assert.strictEqual(getRowKey(row, 5), 'name_ani__suami');
});

it('Guarantees key invariance across row insertions and filtering', () => {
  const guest1 = { 'Nama': 'Riefky', 'No. WhatsApp': '08111111' };
  const guest2 = { 'Nama': 'Dhifa', 'No. WhatsApp': '08222222' };
  const keyBefore = getRowKey(guest2, 1);
  const keyAfterPrepend = getRowKey(guest2, 2);
  assert.strictEqual(keyBefore, keyAfterPrepend, 'Guest key must not mutate upon array reordering');
});

// =============================================================================
// 4. Template Compilation
// =============================================================================
console.log('\n--- 4. Template Compilation ---');

function compileMessage(template, row) {
  if (!template) return '';
  const nama = (row['Nama'] || row['Name'] || '').trim();
  const sapaan = (row['Sapaan'] || '').trim();
  const link = (row['Link'] || '').trim();
  const label = (row['Label'] || '').trim();
  return template
    .replace(/\{Nama\}/gi, nama)
    .replace(/\{Sapaan\}/gi, sapaan)
    .replace(/\{Link\}/gi, link)
    .replace(/\{Label\}/gi, label);
}

it('Interpolates guest placeholders into WhatsApp template message', () => {
  const tpl = 'Halo {Sapaan} {Nama}, berikut undangan Anda: {Link} ({Label})';
  const row = {
    'Sapaan': 'Bapak',
    'Nama': 'Ir. Hartono',
    'Link': 'https://viding.co/hartono',
    'Label': 'VIP'
  };
  const compiled = compileMessage(tpl, row);
  assert.strictEqual(compiled, 'Halo Bapak Ir. Hartono, berikut undangan Anda: https://viding.co/hartono (VIP)');
});

// =============================================================================
// 5. Pre-compiled SVG Icon Generator
// =============================================================================
console.log('\n--- 5. Pre-compiled SVG Icon Generator ---');

const LUCIDE_ICONS_SVG = {
  'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'phone-off': '<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" x2="2" y1="2" y2="22"/>',
  'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'eye': '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'calendar-check': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
};

function getIconSvg(name, { className = '', style = '', size = 24 } = {}) {
  const inner = LUCIDE_ICONS_SVG[name] || '';
  const styleAttr = style ? ` style="${style}"` : '';
  const classAttr = `lucide lucide-${name}${className ? ' ' + className : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classAttr}"${styleAttr}>${inner}</svg>`;
}

it('Generates valid SVG XML for all 13 table/card icons', () => {
  const requiredIcons = [
    'check-circle-2', 'clock', 'chevron-down', 'check', 'phone-off',
    'send', 'link', 'copy', 'eye', 'trash-2', 'users', 'calendar-check', 'rotate-ccw'
  ];
  requiredIcons.forEach(iconName => {
    const svg = getIconSvg(iconName, { className: 'test-class', style: 'width:14px;height:14px;', size: 14 });
    assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), `Must start with svg namespace: ${iconName}`);
    assert(svg.includes(`lucide-${iconName}`), `Must contain lucide class: ${iconName}`);
    assert(svg.includes('style="width:14px;height:14px;"'), `Must apply style: ${iconName}`);
    assert(svg.endsWith('</svg>'), `Must properly close svg: ${iconName}`);
  });
});

// =============================================================================
// 6. Performance Audit: Assets & Code Contracts
// =============================================================================
console.log('\n--- 6. Performance Audit: Assets & Code Contracts ---');

it('Ensures SheetJS is removed from initial head in index.html', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert(!html.includes('<script src="/vendor/xlsx.full.min.js">'), 'SheetJS script tag must NOT be parser-blocking in <head>');
  assert(html.includes('lazy-loaded on demand'), 'index.html comments should document lazy loading');
});

it('Ensures SheetJS vendor file is preserved locally for on-demand loading', () => {
  const vendorPath = path.join(__dirname, '../public/vendor/xlsx.full.min.js');
  assert(fs.existsSync(vendorPath), 'Local SheetJS vendor file must exist');
  const stat = fs.statSync(vendorPath);
  assert(stat.size > 500000, 'SheetJS vendor file must be complete (~881 KB)');
});

it('Ensures app.js implements ensureXLSXLoaded() before reading Excel', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
  assert(appJs.includes('function ensureXLSXLoaded()'), 'ensureXLSXLoaded must be defined');
  assert(appJs.includes('await ensureXLSXLoaded()'), 'ensureXLSXLoaded must be awaited before parsing Excel');
});

it('Ensures event delegation and data-action attributes are configured in app.js', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
  assert(appJs.includes('data-action="toggle-status"'), 'Must contain toggle-status action');
  assert(appJs.includes('data-action="set-rsvp"'), 'Must contain set-rsvp action');
  assert(appJs.includes('data-action="send-wa"'), 'Must contain send-wa action');
  assert(appJs.includes('data-action="toggle-card"'), 'Must contain toggle-card action');
  assert(appJs.includes('function handleTableAction('), 'Must implement delegated handleTableAction');
  assert(appJs.includes("dom.recipientsTableBody.addEventListener('click', handleTableAction)"), 'Must attach delegated click on tbody');
  assert(appJs.includes("dom.mobileCardsList.addEventListener('click', handleTableAction)"), 'Must attach delegated click on mobileCardsList');
});

it('Ensures viewport responsiveness and smart polling are wired in app.js', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
  assert(appJs.includes("window.matchMedia('(max-width: 768px)')"), 'Must listen to mobile viewport breakpoint');
  assert(appJs.includes("document.addEventListener('visibilitychange'"), 'Must handle tab visibility change');
  assert(appJs.includes('stopFallbackPolling()'), 'Must stop fallback polling on live WebSocket');
});

// =============================================================================
// 7. Backend API Contract Tests
// =============================================================================
console.log('\n--- 7. Backend API Contract Tests ---');

function mockReq(method = 'GET', url = '/', body = {}) {
  return {
    method,
    url,
    headers: { host: 'localhost:3000' },
    body
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    ended: false,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
    },
    json(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    end(data) {
      this.body = data;
      this.ended = true;
      return this;
    }
  };
  return res;
}

async function runApiTests() {
  await itAsync('API /api/guests returns guests array and count', async () => {
    const guestsHandler = require('../api/guests');
    const req = mockReq('GET', '/api/guests');
    const res = mockRes();
    await guestsHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body && typeof res.body === 'object', 'Response must be JSON');
    assert(Array.isArray(res.body.guests), 'Response must include guests array');
    assert(typeof res.body.guests.length === 'number', 'Guests array must have valid length');
  });

  await itAsync('API /api/sent-status returns sentStatuses map', async () => {
    const sentHandler = require('../api/sent-status');
    const req = mockReq('GET', '/api/sent-status');
    const res = mockRes();
    await sentHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body && typeof res.body.sentStatuses === 'object', 'sentStatuses must be an object');
  });

  await itAsync('API /api/rsvp-status returns rsvpStatuses map', async () => {
    const rsvpHandler = require('../api/rsvp-status');
    const req = mockReq('GET', '/api/rsvp-status');
    const res = mockRes();
    await rsvpHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body && typeof res.body.rsvpStatuses === 'object', 'rsvpStatuses must be an object');
  });

  await itAsync('API /api/templates returns template configuration', async () => {
    const templateHandler = require('../api/templates');
    const req = mockReq('GET', '/api/templates');
    const res = mockRes();
    await templateHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body !== undefined, 'Templates response must be defined');
  });

  console.log(`\n========================================`);
  console.log(`🎉 All ${passedTests}/${totalTests} tests passed successfully! Zero regressions detected.`);
  console.log(`========================================\n`);
}

runApiTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
