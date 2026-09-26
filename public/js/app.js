/**
 * Viding WA Template Generator — Production Edition
 * Backed by Supabase (guests, sent_statuses, templates) with Realtime sync.
 * PIN gate validates access via /api/verify-pin before the app loads.
 */

(function () {
  'use strict';

  // ===========================================================================
  // Preset Templates
  // ===========================================================================
  const PRESET_TEMPLATES = {
    formal: `Kepada Yth.\n[Sapaan] [Nama]\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara resepsi pernikahan kami:\n\n*Dhifa & Riefky*\n\nBerikut tautan undangan kami untuk informasi lengkap mengenai waktu & lokasi acara:\n👉 [Link]\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu bagi kami berdua.\n\nMohon maaf atas keterbatasan pengiriman undangan yang disampaikan melalui pesan ini.\n\nTerima kasih banyak atas perhatian dan doa restunya.\n\nSalam hangat,\n*Dhifa & Riefky*`,
    casual: `Halo [Nama]! ✨\n\nSemoga kamu dan keluarga selalu sehat dan berbahagia yaa.\n\nDengan penuh rasa syukur dan bahagia, kami ingin mengundang kamu untuk hadir dan merayakan momen istimewa pernikahan kami:\n\n*Dhifa & Riefky*\n\nInfo detail mengenai waktu dan lokasi acara bisa kamu akses langsung di link undangan berikut yaa:\n👉 [Link]\n\nKehadiran dan doa restu dari kamu tentu akan sangat melengkapi kebahagiaan kami berdua di hari spesial nanti. See you there! 🎉\n\nSalam hangat,\n*Dhifa & Riefky*`,
    singkat: `Kepada Yth. [Sapaan] [Nama],\n\nBerikut kami sampaikan tautan undangan resmi pernikahan *Dhifa & Riefky*:\n👉 [Link]\n\nBesar harapan kami agar Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu. Terima kasih banyak atas perhatiannya. 🙏`
  };

  // ===========================================================================
  // State
  // ===========================================================================
  const state = {
    rawRows: [],
    columns: [],
    phoneColumn: '',
    currentFilter: 'all',
    searchQuery: '',
    selectedPreviewIndex: 0,
    sentStatuses: {},
    currentTemplate: ''
  };

  // ===========================================================================
  // DOM Cache
  // ===========================================================================
  const dom = {
    fileInput: document.getElementById('fileInput'),
    dropzone: document.getElementById('dropzone'),
    btnReloadDefault: document.getElementById('btnReloadDefault'),
    fileStatusBar: document.getElementById('fileStatusBar'),
    loadedFileName: document.getElementById('loadedFileName'),
    loadedFileDetails: document.getElementById('loadedFileDetails'),
    phoneColSelect: document.getElementById('phoneColSelect'),
    templatePresetSelect: document.getElementById('templatePresetSelect'),
    templateInput: document.getElementById('templateInput'),
    charCounter: document.getElementById('charCounter'),
    btnSaveCustomTemplate: document.getElementById('btnSaveCustomTemplate'),
    btnResetTemplate: document.getElementById('btnResetTemplate'),
    tagsList: document.getElementById('tagsList'),
    previewGuestSelect: document.getElementById('previewGuestSelect'),
    livePreviewBubble: document.getElementById('livePreviewBubble'),
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterPills: document.getElementById('filterPills'),
    btnMarkAllSent: document.getElementById('btnMarkAllSent'),
    btnResetAllSent: document.getElementById('btnResetAllSent'),
    recipientsTableBody: document.getElementById('recipientsTableBody'),
    emptyState: document.getElementById('emptyState'),
    showingCountText: document.getElementById('showingCountText'),
    progressPercentage: document.getElementById('progressPercentage'),
    progressBarFill: document.getElementById('progressBarFill'),
    statTotalGuests: document.getElementById('statTotalGuests'),
    statTotalPax: document.getElementById('statTotalPax'),
    statSentCount: document.getElementById('statSentCount'),
    statSentPax: document.getElementById('statSentPax'),
    statPendingCount: document.getElementById('statPendingCount'),
    statPendingPax: document.getElementById('statPendingPax'),
    statWithPhone: document.getElementById('statWithPhone'),
    statWithPhonePax: document.getElementById('statWithPhonePax'),
    mobileCardsList: document.getElementById('mobileCardsList'),
    toastContainer: document.getElementById('toastContainer'),
    previewModal: document.getElementById('previewModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    modalGuestTitle: document.getElementById('modalGuestTitle'),
    modalGuestInfo: document.getElementById('modalGuestInfo'),
    modalMessageContent: document.getElementById('modalMessageContent'),
    modalWaLinkInput: document.getElementById('modalWaLinkInput'),
    btnModalCopyLink: document.getElementById('btnModalCopyLink'),
    btnModalCopyText: document.getElementById('btnModalCopyText'),
    btnModalSendWa: document.getElementById('btnModalSendWa'),
    // Custom Confirmation Modal
    customConfirmModal: document.getElementById('customConfirmModal'),
    confirmModalIconWrap: document.getElementById('confirmModalIconWrap'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    btnCancelConfirm: document.getElementById('btnCancelConfirm'),
    btnProceedConfirm: document.getElementById('btnProceedConfirm'),
    // PIN Gate
    pinOverlay: document.getElementById('pinOverlay'),
    pinInput: document.getElementById('pinInput'),
    pinError: document.getElementById('pinError'),
    btnUnlock: document.getElementById('btnUnlock'),
    // Sync indicator
    syncDot: document.getElementById('syncDot'),
    syncLabel: document.getElementById('syncLabel'),
    footerSyncStatus: document.getElementById('footerSyncStatus')
  };

  // ===========================================================================
  // PIN Gate
  // ===========================================================================
  function isUnlocked() {
    return sessionStorage.getItem('viding_unlocked') === 'true';
  }

  function showPinOverlay() {
    dom.pinOverlay.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  }

  function hidePinOverlay() {
    dom.pinOverlay.style.opacity = '0';
    dom.pinOverlay.style.transform = 'scale(1.05)';
    setTimeout(() => { dom.pinOverlay.style.display = 'none'; }, 350);
  }

  async function verifyPin(pin) {
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }

  async function handleUnlock() {
    const pin = dom.pinInput.value.trim();
    if (!pin) return;

    dom.btnUnlock.disabled = true;
    dom.btnUnlock.textContent = 'Memverifikasi...';

    const ok = await verifyPin(pin);
    if (ok) {
      sessionStorage.setItem('viding_unlocked', 'true');
      hidePinOverlay();
      initApp();
    } else {
      dom.pinError.style.display = 'block';
      dom.pinInput.value = '';
      dom.pinInput.classList.add('pin-input-shake');
      setTimeout(() => dom.pinInput.classList.remove('pin-input-shake'), 500);
      dom.btnUnlock.disabled = false;
      dom.btnUnlock.innerHTML = '<i data-lucide="unlock"></i> Buka Akses';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function setupPinGate() {
    if (isUnlocked()) {
      dom.pinOverlay.style.display = 'none';
      initApp();
      return;
    }
    showPinOverlay();
    dom.btnUnlock.addEventListener('click', handleUnlock);
    dom.pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUnlock();
    });
  }

  // ===========================================================================
  // Custom Confirmation Dialog (Point 1)
  // ===========================================================================
  let pendingConfirmAction = null;

  function showCustomConfirm({
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    icon = 'alert-triangle',
    theme = 'danger',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    onConfirm
  }) {
    if (!dom.customConfirmModal) {
      if (confirm(message)) onConfirm();
      return;
    }

    dom.confirmModalTitle.textContent = title;
    dom.confirmModalMessage.textContent = message;
    dom.btnProceedConfirm.textContent = confirmText;
    dom.btnCancelConfirm.textContent = cancelText;

    dom.confirmModalIconWrap.className = `confirm-modal-icon-wrap ${theme}-theme`;
    dom.btnProceedConfirm.className = `btn btn-${theme === 'info' ? 'primary' : 'danger'}`;

    const iconEl = document.getElementById('confirmModalIcon');
    if (iconEl) iconEl.setAttribute('data-lucide', icon);
    setupLucideIcons();

    pendingConfirmAction = onConfirm;
    dom.customConfirmModal.style.display = 'flex';
  }

  function closeConfirmModal() {
    if (dom.customConfirmModal) dom.customConfirmModal.style.display = 'none';
    pendingConfirmAction = null;
  }

  // ===========================================================================
  // WhatsApp Formatting & URL Preview Helpers (Point 5 & 6)
  // ===========================================================================
  function parseWhatsAppFormatting(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);

    // Monospace ```code```
    escaped = escaped.replace(/```([\s\S]+?)```/g, '<code>$1</code>');
    // Bold *bold*
    escaped = escaped.replace(/(^|[\s_~])\*([^\s*][^*]*?[^\s*]|[^\s*])\*(?=[\s_~]|$)/g, '$1<strong>$2</strong>');
    // Italic _italic_
    escaped = escaped.replace(/(^|[\s*~])_([^\s_][^_]*?[^\s_]|[^\s_])_(?=[\s*~]|$)/g, '$1<em>$2</em>');
    // Strikethrough ~strike~
    escaped = escaped.replace(/(^|[\s*_])~([^\s~][^~]*?[^\s~]|[^\s~])~(?=[\s*_]|$)/g, '$1<del>$2</del>');

    // Auto-link URLs
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    escaped = escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="wa-link">$1</a>');

    // Convert newlines to <br>
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  function extractFirstUrl(text) {
    if (!text) return null;
    const match = text.match(/(https?:\/\/[^\s]+)/);
    return match ? match[1] : null;
  }

  async function renderUrlPreview(url, container) {
    if (!url || !container) return;
    let hostname = '';
    try {
      hostname = new URL(url).hostname;
    } catch {
      hostname = url;
    }

    container.innerHTML = `
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="wa-og-card">
        <div class="wa-og-body">
          <div class="wa-og-domain">${escapeHtml(hostname)}</div>
          <div class="wa-og-title">Memuat pratinjau tautan...</div>
        </div>
      </a>
    `;

    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) return;
      const meta = await res.json();
      if (!meta) return;

      container.innerHTML = `
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="wa-og-card">
          ${meta.image ? `
            <div class="wa-og-img-wrap">
              <img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title || '')}" class="wa-og-img" onerror="this.parentElement.style.display='none'">
            </div>
          ` : ''}
          <div class="wa-og-body">
            <div class="wa-og-domain">${escapeHtml(meta.siteName || hostname)}</div>
            <div class="wa-og-title">${escapeHtml(meta.title || url)}</div>
            ${meta.description ? `<div class="wa-og-desc">${escapeHtml(meta.description)}</div>` : ''}
          </div>
        </a>
      `;
    } catch (e) {
      console.warn('Link preview fetch failed:', e);
    }
  }

  // ===========================================================================
  // Sync Indicator
  // ===========================================================================
  function setSyncStatus(status) {
    const states = {
      connecting: { dot: 'sync-dot-connecting', label: 'Menghubungkan...', footer: '🔵 Menghubungkan' },
      live: { dot: 'sync-dot-live', label: 'Realtime Aktif', footer: 'Sinkronisasi aktif 🟢' },
      disconnected: { dot: 'sync-dot-offline', label: 'Offline', footer: '🔴 Offline' }
    };
    const s = states[status] || states.disconnected;
    if (dom.syncDot) dom.syncDot.className = `sync-dot ${s.dot}`;
    if (dom.syncLabel) dom.syncLabel.textContent = s.label;
    if (dom.footerSyncStatus) dom.footerSyncStatus.textContent = s.footer;
  }

  // ===========================================================================
  // Supabase API helpers (calls our Vercel /api/* routes)
  // ===========================================================================
  async function apiGet(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} GET failed: ${res.status}`);
    return res.json();
  }

  async function apiPost(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`${path} POST failed: ${res.status}`);
    return res.json();
  }

  async function apiDelete(path) {
    const res = await fetch(path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`${path} DELETE failed: ${res.status}`);
    return res.json();
  }

  // ===========================================================================
  // Sent Status (Supabase-backed, replaces localStorage)
  // ===========================================================================
  async function loadSentStatuses() {
    try {
      const data = await apiGet('/api/sent-status');
      state.sentStatuses = data.sentStatuses || {};
    } catch (e) {
      console.warn('Could not load sent statuses from Supabase, falling back to localStorage', e);
      try {
        const stored = localStorage.getItem('viding_sent_statuses');
        state.sentStatuses = stored ? JSON.parse(stored) : {};
      } catch { state.sentStatuses = {}; }
    }
  }

  async function persistSentStatus(guestKey, isSent) {
    try {
      await apiPost('/api/sent-status', { guestKey, isSent });
    } catch (e) {
      console.warn('Failed to sync sent status to Supabase', e);
    }
    // Also keep local fallback
    if (isSent) {
      state.sentStatuses[guestKey] = true;
    } else {
      delete state.sentStatuses[guestKey];
    }
  }

  function getRowKey(row, index) {
    const name = (row['Nama'] || row['Name'] || '').trim();
    const phone = (row[state.phoneColumn] || '').toString().trim();
    return `${name}_${phone}_${index}`;
  }

  function isRowSent(row, index) {
    return !!state.sentStatuses[getRowKey(row, index)];
  }

  async function setRowSent(row, index, isSent) {
    const key = getRowKey(row, index);
    if (isSent) { state.sentStatuses[key] = true; } else { delete state.sentStatuses[key]; }
    updateStatsAndProgress();
    await persistSentStatus(key, isSent);
  }

  // ===========================================================================
  // Supabase Realtime Subscription
  // ===========================================================================
  function setupRealtime() {
    if (!supabaseClient) {
      setSyncStatus('disconnected');
      return;
    }

    setSyncStatus('connecting');

    supabaseClient
      .channel('sent-status-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sent_statuses'
      }, (payload) => {
        const { new: newRow, old: oldRow, eventType } = payload;
        if (eventType === 'DELETE') {
          delete state.sentStatuses[oldRow.guest_key];
        } else if (newRow) {
          if (newRow.is_sent) {
            state.sentStatuses[newRow.guest_key] = true;
          } else {
            delete state.sentStatuses[newRow.guest_key];
          }
        }
        updateStatsAndProgress();
        renderTable();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('live');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('disconnected');
        }
      });
  }

  // ===========================================================================
  // Custom Template (Supabase settings table)
  // ===========================================================================
  async function loadCustomTemplate() {
    try {
      const data = await apiGet('/api/templates');
      return data.template || null;
    } catch (e) {
      console.warn('Could not load template from Supabase', e);
      return localStorage.getItem('viding_custom_template');
    }
  }

  async function saveCustomTemplate(template) {
    try {
      await apiPost('/api/templates', { template });
    } catch (e) {
      console.warn('Failed to sync template to Supabase', e);
    }
    localStorage.setItem('viding_custom_template', template);
  }

  // ===========================================================================
  // Guest Data (Supabase + default Excel fallback)
  // ===========================================================================
  async function loadGuestsFromSupabase() {
    try {
      const data = await apiGet('/api/guests');
      const guests = data.guests || [];
      if (guests.length > 0) {
        const rows = guests.map(g => g.raw_data);
        processRows(rows, 'Data tersimpan (Supabase)');
        return true;
      }
    } catch (e) {
      console.warn('Could not load guests from Supabase', e);
    }
    return false;
  }

  async function saveGuestsToSupabase(rows) {
    try {
      await apiPost('/api/guests', { rows });
    } catch (e) {
      console.warn('Failed to save guests to Supabase', e);
    }
  }

  function loadDefaultExcel() {
    fetch('/api/default-excel')
      .then(res => {
        if (!res.ok) throw new Error('Default Excel not found');
        return res.arrayBuffer();
      })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rows.length > 0) {
          processRows(rows, 'invitation_list_36032.xlsx (Bawaan)');
          saveGuestsToSupabase(rows);
          showToast('Template bawaan berhasil dimuat!', 'success');
        }
      })
      .catch(err => console.warn('Could not auto-load default Excel:', err));
  }

  function processExcelFile(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const data = new Uint8Array(e.target.result);
      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows || rows.length === 0) {
          showToast('File Excel kosong atau tidak memiliki data.', 'danger');
          return;
        }
        processRows(rows, file.name);
        await saveGuestsToSupabase(rows);
        showToast(`${file.name} berhasil dimuat & disimpan!`, 'success');
      } catch (err) {
        console.error('Error parsing Excel:', err);
        showToast('Gagal membaca file Excel. Pastikan format valid.', 'danger');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function processRows(rows, filename) {
    state.rawRows = rows;
    state.columns = Object.keys(rows[0] || {});
    state.phoneColumn = detectPhoneColumn(state.columns);
    updateFileStatusBar(filename, rows.length);
    populatePhoneColSelector();
    renderTagChips();
    populatePreviewGuestDropdown();
    renderTable();
    updateStatsAndProgress();
    updateLivePreview();
  }

  function detectPhoneColumn(columns) {
    const kws = ['nomor whatsapp', 'no whatsapp', 'whatsapp', 'no wa', 'wa', 'phone', 'nomor telepon', 'telepon', 'telp', 'hp'];
    for (const kw of kws) {
      const found = columns.find(c => c.toLowerCase().trim() === kw);
      if (found) return found;
    }
    for (const kw of kws) {
      const found = columns.find(c => c.toLowerCase().includes(kw));
      if (found) return found;
    }
    return columns[0] || '';
  }

  function updateFileStatusBar(filename, count) {
    dom.fileStatusBar.style.display = 'flex';
    dom.loadedFileName.textContent = filename;
    dom.loadedFileDetails.textContent = `${count} Tamu Undangan terdeteksi`;
  }

  function populatePhoneColSelector() {
    dom.phoneColSelect.innerHTML = '';
    state.columns.forEach(col => {
      const opt = document.createElement('option');
      opt.value = col;
      opt.textContent = col;
      if (col === state.phoneColumn) opt.selected = true;
      dom.phoneColSelect.appendChild(opt);
    });
  }

  // ===========================================================================
  // Tag Chips
  // ===========================================================================
  function renderTagChips() {
    dom.tagsList.innerHTML = '';
    if (state.columns.length === 0) {
      dom.tagsList.innerHTML = '<span style="color: var(--slate-500); font-size: 0.78rem;">Belum ada file Excel yang dimuat.</span>';
      return;
    }
    state.columns.forEach(col => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tag-btn';
      chip.textContent = `[${col}]`;
      chip.title = `Klik untuk memasukkan [${col}] ke dalam template pesan`;
      chip.addEventListener('click', () => insertTagToTemplate(`[${col}]`));
      dom.tagsList.appendChild(chip);
    });
  }

  function insertTagToTemplate(tagText) {
    const ta = dom.templateInput;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    ta.value = ta.value.substring(0, start) + tagText + ta.value.substring(end);
    ta.selectionStart = ta.selectionEnd = start + tagText.length;
    ta.focus();
    state.currentTemplate = ta.value;
    updateCharCounter();
    updateLivePreview();
    renderTable();
    showToast(`Tag ${tagText} disisipkan!`, 'success');
  }

  // ===========================================================================
  // Phone Normalization & Message Compiler
  // ===========================================================================
  function normalizePhone(rawPhone) {
    if (!rawPhone) return { isValid: false, formatted: '', raw: '' };
    let str = rawPhone.toString().trim();
    let digits = str.replace(/[^0-9]/g, '');
    if (!digits || digits === '0' || digits.length < 8) return { isValid: false, formatted: '', raw: str };
    if (digits.startsWith('0')) digits = '62' + digits.substring(1);
    else if (digits.startsWith('8')) digits = '62' + digits;
    else if (!digits.startsWith('62')) {
      if (!(digits.length >= 9 && digits.length <= 15)) return { isValid: false, formatted: '', raw: str };
    }
    if (digits.length >= 10 && digits.length <= 16) return { isValid: true, formatted: digits, raw: str };
    return { isValid: false, formatted: digits, raw: str };
  }

  function compileMessage(template, row) {
    if (!template) return '';
    return template.replace(/\[([^\]]+)\]/g, (match, tag) => {
      const cleanTag = tag.trim().toLowerCase();
      for (const col of Object.keys(row)) {
        if (col.trim().toLowerCase() === cleanTag) {
          const val = row[col];
          return (val !== null && val !== undefined && val !== '-') ? String(val) : '';
        }
      }
      return match;
    });
  }

  function generateWaUrl(phone, msg) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  // ===========================================================================
  // Live Preview
  // ===========================================================================
  function populatePreviewGuestDropdown() {
    dom.previewGuestSelect.innerHTML = '';
    state.rawRows.forEach((row, idx) => {
      const name = (row['Nama'] || row['Name'] || `Tamu #${idx + 1}`).trim();
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${idx + 1}. ${name}`;
      dom.previewGuestSelect.appendChild(opt);
    });
    state.selectedPreviewIndex = 0;
  }

  function updateLivePreview() {
    if (state.rawRows.length === 0) {
      dom.livePreviewBubble.innerHTML = '<em>Silakan unggah file Excel untuk melihat preview pesan undangan secara langsung.</em>';
      return;
    }
    const row = state.rawRows[state.selectedPreviewIndex] || state.rawRows[0];
    const compiled = compileMessage(state.currentTemplate, row);
    const html = escapeHtml(compiled).replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" style="color:#0284C7;text-decoration:underline;font-weight:600;">$1</a>'
    );
    dom.livePreviewBubble.innerHTML = html || '<em>(Pesan kosong)</em>';
  }

  function updateCharCounter() {
    const text = dom.templateInput.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    dom.charCounter.textContent = `${text.length} karakter | ${words} kata`;
  }

  // ===========================================================================
  // Table Rendering
  // ===========================================================================
  function renderTable() {
    const tbody = dom.recipientsTableBody;
    tbody.innerHTML = '';
    if (dom.mobileCardsList) dom.mobileCardsList.innerHTML = '';

    if (state.rawRows.length === 0) {
      dom.emptyState.style.display = 'block';
      dom.showingCountText.textContent = 'Menampilkan 0 undangan';
      return;
    }
    const filtered = filterRows();
    if (filtered.length === 0) {
      dom.emptyState.style.display = 'block';
      dom.showingCountText.textContent = '0 undangan ditemukan dari filter';
      return;
    }
    dom.emptyState.style.display = 'none';
    dom.showingCountText.textContent = `Menampilkan ${filtered.length} dari ${state.rawRows.length} undangan`;

    filtered.forEach(({ row, originalIndex }) => {
      const isSent = isRowSent(row, originalIndex);
      const phoneInfo = normalizePhone(row[state.phoneColumn]);
      const compiledMsg = compileMessage(state.currentTemplate, row);
      const waUrl = phoneInfo.isValid ? generateWaUrl(phoneInfo.formatted, compiledMsg) : '';
      const guestName = (row['Nama'] || row['Name'] || '-').trim();
      const sapaan = (row['Sapaan'] || '').trim();
      const label = (row['Label'] || '').trim();
      const link = (row['Link'] || '').trim();
      const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;

      // 1. Desktop Table Row
      const tr = document.createElement('tr');
      if (isSent) tr.classList.add('row-is-sent');

      const tdNo = document.createElement('td');
      tdNo.className = 'col-num';
      tdNo.textContent = originalIndex + 1;

      const tdStatus = document.createElement('td');
      tdStatus.className = 'col-status';
      const btnStatus = document.createElement('button');
      btnStatus.type = 'button';
      btnStatus.className = `status-pill-btn ${isSent ? 'status-sent' : 'status-pending'}`;
      btnStatus.innerHTML = isSent
        ? `<i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> Sudah Dikirim`
        : `<i data-lucide="clock" style="width:14px;height:14px;"></i> Belum Dikirim`;
      btnStatus.title = isSent ? 'Klik untuk tandai Belum Dikirim' : 'Klik untuk tandai Sudah Dikirim';
      btnStatus.addEventListener('click', async () => {
        const next = !isRowSent(row, originalIndex);
        await setRowSent(row, originalIndex, next);
        renderTable();
        showToast(next ? `${guestName} ditandai Sudah Dikirim!` : `${guestName} ditandai Belum Dikirim.`, 'success');
      });
      tdStatus.appendChild(btnStatus);

      const tdName = document.createElement('td');
      tdName.className = 'col-name';
      let chips = '';
      if (sapaan) chips += `<span class="meta-chip">${escapeHtml(sapaan)}</span>`;
      chips += `<span class="meta-chip meta-chip-blue">👥 ${pax} Tamu</span>`;
      if (label) chips += `<span class="meta-chip">${escapeHtml(label)}</span>`;
      tdName.innerHTML = `<div class="guest-name-cell"><div class="guest-name-text">${escapeHtml(guestName)}</div><div class="guest-meta-tags">${chips}</div></div>`;

      const tdPhone = document.createElement('td');
      tdPhone.className = 'col-phone phone-cell-text';
      tdPhone.innerHTML = phoneInfo.isValid
        ? `<span class="phone-valid"><i data-lucide="check" style="width:14px;height:14px;"></i> +${escapeHtml(phoneInfo.formatted)}</span>`
        : `<span class="phone-empty"><i data-lucide="phone-off" style="width:12px;height:12px;"></i> Tanpa Nomor</span>`;

      const tdLink = document.createElement('td');
      tdLink.className = 'col-link';
      tdLink.innerHTML = (link && link.startsWith('http'))
        ? `<a href="${escapeHtml(link)}" target="_blank" class="link-url-text" title="${escapeHtml(link)}">${escapeHtml(link)}</a>`
        : `<span style="color:var(--slate-400);">-</span>`;

      const tdActions = document.createElement('td');
      tdActions.className = 'col-actions';
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'action-buttons-group';

      const btnSend = document.createElement('button');
      btnSend.type = 'button';
      btnSend.className = 'btn-send-wa';
      btnSend.innerHTML = `<i data-lucide="send" style="width:13px;height:13px;"></i> Kirim WA`;
      if (!phoneInfo.isValid) {
        btnSend.classList.add('btn-action-disabled');
      } else {
        btnSend.addEventListener('click', async () => {
          window.open(waUrl, '_blank');
          await setRowSent(row, originalIndex, true);
          renderTable();
          showToast(`Membuka WhatsApp untuk ${guestName}...`, 'success');
        });
      }

      const btnCopyLink = document.createElement('button');
      btnCopyLink.type = 'button';
      btnCopyLink.className = 'btn-copy-link';
      btnCopyLink.innerHTML = `<i data-lucide="link" style="width:13px;height:13px;"></i> Salin Link`;
      if (!phoneInfo.isValid) {
        btnCopyLink.classList.add('btn-action-disabled');
      } else {
        btnCopyLink.addEventListener('click', () => copyToClipboard(waUrl, `Link wa.me untuk ${guestName} berhasil disalin!`));
      }

      const btnCopyMsg = document.createElement('button');
      btnCopyMsg.type = 'button';
      btnCopyMsg.className = 'btn-copy-msg';
      btnCopyMsg.innerHTML = `<i data-lucide="copy" style="width:13px;height:13px;"></i> Salin Pesan`;
      btnCopyMsg.addEventListener('click', () => copyToClipboard(compiledMsg, `Teks undangan untuk ${guestName} disalin!`));

      const btnView = document.createElement('button');
      btnView.type = 'button';
      btnView.className = 'btn-view-preview';
      btnView.innerHTML = `<i data-lucide="eye" style="width:14px;height:14px;"></i>`;
      btnView.title = 'Lihat detail pesan';
      btnView.addEventListener('click', () => openPreviewModal(row, originalIndex, compiledMsg, waUrl, phoneInfo));

      actionsWrapper.appendChild(btnSend);
      actionsWrapper.appendChild(btnCopyLink);
      actionsWrapper.appendChild(btnCopyMsg);
      actionsWrapper.appendChild(btnView);
      tdActions.appendChild(actionsWrapper);

      tr.appendChild(tdNo);
      tr.appendChild(tdStatus);
      tr.appendChild(tdName);
      tr.appendChild(tdPhone);
      tr.appendChild(tdLink);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);

      // 2. Native Mobile Touch Card
      if (dom.mobileCardsList) {
        const card = document.createElement('div');
        card.className = `mobile-guest-card ${isSent ? 'card-sent' : ''}`;

        card.innerHTML = `
          <div class="mobile-guest-header">
            <div class="mobile-guest-main">
              <div class="mobile-guest-num-row">
                <span class="mobile-guest-num">#${originalIndex + 1}</span>
                ${sapaan ? `<span class="mobile-guest-sapaan">${escapeHtml(sapaan)}</span>` : ''}
              </div>
              <div class="mobile-guest-name">${escapeHtml(guestName)}</div>
              <div class="mobile-guest-badges">
                <span class="mobile-pax-badge">👥 ${pax} Tamu</span>
                ${label ? `<span class="mobile-category-chip">${escapeHtml(label)}</span>` : ''}
              </div>
            </div>
            <button type="button" class="mobile-status-toggle ${isSent ? 'status-sent' : 'status-pending'}">
              <i data-lucide="${isSent ? 'check-circle-2' : 'clock'}" style="width:13px;height:13px;"></i>
              ${isSent ? 'Terkirim' : 'Belum Kirim'}
            </button>
          </div>

          <div class="mobile-guest-contact">
            <span class="mobile-contact-pill ${phoneInfo.isValid ? 'has-phone' : ''}">
              <i data-lucide="${phoneInfo.isValid ? 'check' : 'phone-off'}" style="width:13px;height:13px;"></i>
              ${phoneInfo.isValid ? '+' + escapeHtml(phoneInfo.formatted) : 'Tanpa WhatsApp'}
            </span>
            ${(link && link.startsWith('http')) ? `
              <a href="${escapeHtml(link)}" target="_blank" class="mobile-link-chip" title="${escapeHtml(link)}">
                <i data-lucide="external-link" style="width:12px;height:12px;"></i> Undangan
              </a>
            ` : ''}
          </div>

          <div class="mobile-card-actions">
            <button type="button" class="btn btn-outline btn-mobile-preview">
              <i data-lucide="eye"></i> Preview
            </button>
            <button type="button" class="btn btn-primary btn-mobile-send ${!phoneInfo.isValid ? 'btn-action-disabled' : ''}">
              <i data-lucide="send"></i> Buka WA
            </button>
          </div>
        `;

        const btnMobStatus = card.querySelector('.mobile-status-toggle');
        btnMobStatus.addEventListener('click', async () => {
          const next = !isRowSent(row, originalIndex);
          await setRowSent(row, originalIndex, next);
          renderTable();
          showToast(next ? `${guestName} ditandai Sudah Dikirim!` : `${guestName} ditandai Belum Dikirim.`, 'success');
        });

        const btnMobPreview = card.querySelector('.btn-mobile-preview');
        btnMobPreview.addEventListener('click', () => openPreviewModal(row, originalIndex, compiledMsg, waUrl, phoneInfo));

        const btnMobSend = card.querySelector('.btn-mobile-send');
        if (phoneInfo.isValid) {
          btnMobSend.addEventListener('click', async () => {
            window.open(waUrl, '_blank');
            await setRowSent(row, originalIndex, true);
            renderTable();
            showToast(`Membuka WhatsApp untuk ${guestName}...`, 'success');
          });
        }

        dom.mobileCardsList.appendChild(card);
      }
    });

    setupLucideIcons();
  }

  function filterRows() {
    const q = state.searchQuery.toLowerCase().trim();
    const filter = state.currentFilter;
    return state.rawRows.map((row, originalIndex) => ({ row, originalIndex })).filter(({ row, originalIndex }) => {
      const phoneInfo = normalizePhone(row[state.phoneColumn]);
      const isSent = isRowSent(row, originalIndex);
      const name = (row['Nama'] || row['Name'] || '').toString().toLowerCase();
      const label = (row['Label'] || '').toString().toLowerCase();
      const phone = (row[state.phoneColumn] || '').toString().toLowerCase();
      if (filter === 'pending' && isSent) return false;
      if (filter === 'sent' && !isSent) return false;
      if (filter === 'has-phone' && !phoneInfo.isValid) return false;
      if (filter === 'no-phone' && phoneInfo.isValid) return false;
      if (q) return name.includes(q) || label.includes(q) || phone.includes(q);
      return true;
    });
  }

  function updateStatsAndProgress() {
    const total = state.rawRows.length;
    let withPhone = 0, sentCount = 0;
    let totalPax = 0, sentPax = 0, withPhonePax = 0;

    state.rawRows.forEach((row, idx) => {
      const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;
      totalPax += pax;

      const hasPhone = normalizePhone(row[state.phoneColumn]).isValid;
      if (hasPhone) {
        withPhone++;
        withPhonePax += pax;
      }
      if (isRowSent(row, idx)) {
        sentCount++;
        sentPax += pax;
      }
    });

    const pendingCount = total - sentCount;
    const pendingPax = totalPax - sentPax;
    const percentage = total > 0 ? Math.round((sentCount / total) * 100) : 0;

    dom.statTotalGuests.textContent = total;
    if (dom.statTotalPax) dom.statTotalPax.textContent = `👥 ${totalPax} Tamu`;

    dom.statSentCount.textContent = `${sentCount} (${percentage}%)`;
    if (dom.statSentPax) dom.statSentPax.textContent = `👥 ${sentPax} Tamu`;

    dom.statPendingCount.textContent = pendingCount;
    if (dom.statPendingPax) dom.statPendingPax.textContent = `👥 ${pendingPax} Tamu`;

    dom.statWithPhone.textContent = withPhone;
    if (dom.statWithPhonePax) dom.statWithPhonePax.textContent = `👥 ${withPhonePax} Tamu`;

    dom.progressPercentage.textContent = `${percentage}% (${sentCount}/${total} Undangan · ${sentPax}/${totalPax} Tamu)`;
    dom.progressBarFill.style.width = `${percentage}%`;

    document.getElementById('countFilterAll').textContent = total;
    document.getElementById('countFilterPending').textContent = pendingCount;
    document.getElementById('countFilterSent').textContent = sentCount;
    document.getElementById('countFilterHasPhone').textContent = withPhone;
    document.getElementById('countFilterNoPhone').textContent = total - withPhone;
  }

  // ===========================================================================
  // Modal Preview
  // ===========================================================================
  function openPreviewModal(row, index, compiledMsg, waUrl, phoneInfo) {
    const name = (row['Nama'] || row['Name'] || '-').trim();
    const sapaan = (row['Sapaan'] || '').trim();
    const isSent = isRowSent(row, index);
    const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;

    dom.modalGuestTitle.textContent = `Pesan Undangan: ${sapaan} ${name}`;
    dom.modalGuestInfo.innerHTML = `
      <span class="meta-chip">Undangan #${index + 1}</span>
      <span class="meta-chip meta-chip-blue">👥 ${pax} Tamu</span>
      <span class="meta-chip ${phoneInfo.isValid ? 'meta-chip-blue' : ''}">${phoneInfo.isValid ? 'WA: +' + phoneInfo.formatted : 'Tanpa Nomor WA'}</span>
      <span class="meta-chip" style="background:${isSent ? '#DCFCE7' : '#F1F5F9'};color:${isSent ? '#166534' : '#475569'};font-weight:700;">${isSent ? 'Sudah Dikirim' : 'Belum Dikirim'}</span>`;

    const formattedHtml = parseWhatsAppFormatting(compiledMsg);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    dom.modalMessageContent.innerHTML = `
      <div class="wa-msg-text">${formattedHtml}</div>
      <div id="modalUrlPreviewWrap"></div>
      <div class="wa-meta-time">
        <span>${timeStr}</span>
        <span class="wa-ticks">✓✓</span>
      </div>
    `;

    const firstUrl = extractFirstUrl(compiledMsg);
    if (firstUrl) {
      renderUrlPreview(firstUrl, document.getElementById('modalUrlPreviewWrap'));
    }

    dom.modalWaLinkInput.value = waUrl || '(Nomor WA tidak tersedia)';
    dom.btnModalCopyLink.disabled = !phoneInfo.isValid;
    dom.btnModalSendWa.disabled = !phoneInfo.isValid;
    dom.btnModalCopyLink.onclick = () => copyToClipboard(waUrl, 'Link wa.me berhasil disalin!');
    dom.btnModalCopyText.onclick = () => copyToClipboard(compiledMsg, 'Teks pesan berhasil disalin!');
    dom.btnModalSendWa.onclick = async () => {
      if (phoneInfo.isValid) {
        window.open(waUrl, '_blank');
        await setRowSent(row, index, true);
        renderTable();
        closeModal();
        showToast(`Membuka WhatsApp untuk ${name}...`, 'success');
      }
    };
    dom.previewModal.style.display = 'flex';
    setupLucideIcons();
  }

  function closeModal() { dom.previewModal.style.display = 'none'; }

  // ===========================================================================
  // Clipboard & Toast
  // ===========================================================================
  function copyToClipboard(text, successMsg) {
    if (!text) { showToast('Tidak ada teks untuk disalin.', 'danger'); return; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(successMsg, 'success')).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(successMsg, 'success'); } catch { showToast('Gagal menyalin teks.', 'danger'); }
    document.body.removeChild(ta);
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'danger' ? 'toast-danger' : ''}`;
    const icon = type === 'danger' ? 'alert-triangle' : 'check-circle-2';
    toast.innerHTML = `<i data-lucide="${icon}" style="width:16px;height:16px;"></i> <span>${escapeHtml(message)}</span>`;
    dom.toastContainer.appendChild(toast);
    setupLucideIcons();
    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s, transform 0.25s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function setupLucideIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  // ===========================================================================
  // Event Listeners
  // ===========================================================================
  function setupEventListeners() {
    const handleFileUpload = (file) => {
      if (!file) return;
      if (state.rawRows.length > 0) {
        showCustomConfirm({
          title: 'Ganti Data Tamu Excel?',
          message: `Mengunggah "${file.name}" akan menggantikan daftar tamu saat ini (${state.rawRows.length} undangan). Lanjutkan?`,
          icon: 'file-spreadsheet',
          theme: 'info',
          confirmText: 'Ya, Ganti Data',
          cancelText: 'Batal',
          onConfirm: () => processExcelFile(file)
        });
      } else {
        processExcelFile(file);
      }
    };

    dom.fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
        dom.fileInput.value = '';
      }
    });

    ['dragenter', 'dragover'].forEach(ev => {
      dom.dropzone.addEventListener(ev, (e) => { e.preventDefault(); dom.dropzone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dom.dropzone.addEventListener(ev, (e) => { e.preventDefault(); dom.dropzone.classList.remove('dragover'); });
    });
    dom.dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
    });

    dom.btnReloadDefault.addEventListener('click', () => {
      if (state.rawRows.length > 0) {
        showCustomConfirm({
          title: 'Muat Ulang Template Excel Bawaan?',
          message: 'Data tamu saat ini akan digantikan dengan data Excel bawaan.',
          icon: 'refresh-cw',
          theme: 'info',
          confirmText: 'Ya, Muat Ulang',
          cancelText: 'Batal',
          onConfirm: () => loadDefaultExcel()
        });
      } else {
        loadDefaultExcel();
      }
    });

    dom.phoneColSelect.addEventListener('change', (e) => {
      state.phoneColumn = e.target.value;
      renderTable();
      updateStatsAndProgress();
      showToast(`Kolom WhatsApp: ${state.phoneColumn}`, 'success');
    });

    dom.templatePresetSelect.addEventListener('change', async (e) => {
      const key = e.target.value;
      if (key === 'custom') {
        const saved = await loadCustomTemplate();
        if (saved) state.currentTemplate = saved;
      } else if (PRESET_TEMPLATES[key]) {
        state.currentTemplate = PRESET_TEMPLATES[key];
      }
      dom.templateInput.value = state.currentTemplate;
      updateCharCounter();
      updateLivePreview();
      renderTable();
      showToast('Template diganti!', 'success');
    });

    dom.templateInput.addEventListener('input', (e) => {
      state.currentTemplate = e.target.value;
      updateCharCounter();
      updateLivePreview();
      renderTable();
    });

    dom.btnSaveCustomTemplate.addEventListener('click', async () => {
      await saveCustomTemplate(dom.templateInput.value);
      dom.templatePresetSelect.value = 'custom';
      showToast('Template kustom berhasil disimpan!', 'success');
    });

    dom.btnResetTemplate.addEventListener('click', () => {
      showCustomConfirm({
        title: 'Reset Template Pesan?',
        message: 'Template saat ini akan dikembalikan ke format bawaan (Formal). Perubahan kustom yang belum disimpan akan hilang.',
        icon: 'rotate-ccw',
        theme: 'danger',
        confirmText: 'Ya, Reset Template',
        cancelText: 'Batal',
        onConfirm: () => {
          state.currentTemplate = PRESET_TEMPLATES.formal;
          dom.templatePresetSelect.value = 'formal';
          dom.templateInput.value = state.currentTemplate;
          updateCharCounter();
          updateLivePreview();
          renderTable();
          showToast('Template dikembalikan ke format Formal.', 'success');
        }
      });
    });

    dom.previewGuestSelect.addEventListener('change', (e) => {
      state.selectedPreviewIndex = parseInt(e.target.value, 10);
      updateLivePreview();
    });

    dom.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      dom.btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      renderTable();
    });

    dom.btnClearSearch.addEventListener('click', () => {
      dom.searchInput.value = '';
      state.searchQuery = '';
      dom.btnClearSearch.style.display = 'none';
      renderTable();
    });

    dom.filterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      dom.filterPills.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      renderTable();
    });

    dom.btnMarkAllSent.addEventListener('click', () => {
      const filtered = filterRows();
      if (filtered.length === 0) {
        showToast('Tidak ada data tamu yang ditampilkan.', 'danger');
        return;
      }
      showCustomConfirm({
        title: 'Tandai Semua Sudah Dikirim?',
        message: `Tandai ${filtered.length} tamu yang saat ini tampil di filter sebagai "Sudah Dikirim"?`,
        icon: 'check-circle-2',
        theme: 'info',
        confirmText: `Ya, Tandai (${filtered.length})`,
        cancelText: 'Batal',
        onConfirm: async () => {
          for (const { row, originalIndex } of filtered) {
            await setRowSent(row, originalIndex, true);
          }
          renderTable();
          showToast(`${filtered.length} tamu ditandai Sudah Dikirim!`, 'success');
        }
      });
    });

    dom.btnResetAllSent.addEventListener('click', () => {
      showCustomConfirm({
        title: 'Reset Semua Status Pengiriman?',
        message: 'Apakah Anda yakin ingin mengembalikan seluruh status tamu menjadi "Belum Dikirim"? Data status yang tersimpan di cloud juga akan dihapus.',
        icon: 'rotate-ccw',
        theme: 'danger',
        confirmText: 'Ya, Reset Semua',
        cancelText: 'Batal',
        onConfirm: async () => {
          try {
            await apiDelete('/api/sent-status');
          } catch (e) {
            console.warn('Failed to reset on Supabase', e);
          }
          state.sentStatuses = {};
          renderTable();
          updateStatsAndProgress();
          showToast('Semua status pengiriman berhasil di-reset.', 'success');
        }
      });
    });

    // Custom confirm modal listeners
    if (dom.btnCancelConfirm) {
      dom.btnCancelConfirm.addEventListener('click', closeConfirmModal);
    }
    if (dom.btnProceedConfirm) {
      dom.btnProceedConfirm.addEventListener('click', () => {
        if (typeof pendingConfirmAction === 'function') {
          const action = pendingConfirmAction;
          closeConfirmModal();
          action();
        } else {
          closeConfirmModal();
        }
      });
    }
    if (dom.customConfirmModal) {
      dom.customConfirmModal.addEventListener('click', (e) => {
        if (e.target === dom.customConfirmModal) closeConfirmModal();
      });
    }

    dom.btnCloseModal.addEventListener('click', closeModal);
    dom.previewModal.addEventListener('click', (e) => { if (e.target === dom.previewModal) closeModal(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dom.customConfirmModal && dom.customConfirmModal.style.display === 'flex') {
          closeConfirmModal();
        } else {
          closeModal();
        }
      }
    });
  }

  // ===========================================================================
  // App Init (after PIN unlocked)
  // ===========================================================================
  async function initApp() {
    setupEventListeners();
    setupLucideIcons();
    setupRealtime();

    // Load template
    const savedCustom = await loadCustomTemplate();
    if (savedCustom) {
      state.currentTemplate = savedCustom;
      dom.templatePresetSelect.value = 'custom';
    } else {
      state.currentTemplate = PRESET_TEMPLATES.formal;
      dom.templatePresetSelect.value = 'formal';
    }
    dom.templateInput.value = state.currentTemplate;
    updateCharCounter();

    // Load sent statuses
    await loadSentStatuses();

    // Load guests: prefer Supabase, fall back to default Excel
    const loadedFromDB = await loadGuestsFromSupabase();
    if (!loadedFromDB) {
      loadDefaultExcel();
    } else {
      updateLivePreview();
    }
  }

  // ===========================================================================
  // Entry Point
  // ===========================================================================
  function bootstrap() {
    setupPinGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
