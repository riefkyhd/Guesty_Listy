// public/js/config.js
// Supabase client configuration (safe to expose anon key in frontend)
const SUPABASE_URL = 'https://frsovtlwvantrzjojfzs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc292dGx3dmFudHJ6am9qZnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzE5NzgsImV4cCI6MjEwNjAwNzk3OH0.EWUtDbimDb_SXN2rcqpZxclNp3yYBK-maW0fWQIb__8';

// Initialise once; export for app.js
// eslint-disable-next-line no-undef
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
