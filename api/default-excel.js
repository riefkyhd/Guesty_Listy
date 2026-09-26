// api/default-excel.js
// Vercel Serverless Function: Serves the bundled default Excel file
const fs = require('fs');
const path = require('path');

const DEFAULT_EXCEL = path.join(process.cwd(), 'invitation_list_36032.xlsx');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!fs.existsSync(DEFAULT_EXCEL)) {
    return res.status(404).json({ error: 'Default Excel file not found' });
  }

  const stat = fs.statSync(DEFAULT_EXCEL);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', 'inline; filename="invitation_list_36032.xlsx"');
  res.status(200);
  fs.createReadStream(DEFAULT_EXCEL).pipe(res);
};
