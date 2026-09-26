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
    statSentCount: document.getElementById('statSentCount'),
    statPendingCount: document.getElementById('statPendingCount'),
    statWithPhone: document.getElementById('statWithPhone'),
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
    if (state.rawRows.length === 0) {
      dom.emptyState.style.display = 'block';
      dom.showingCountText.textContent = 'Menampilkan 0 tamu';
      return;
    }
    const filtered = filterRows();
    if (filtered.length === 0) {
      dom.emptyState.style.display = 'block';
      dom.showingCountText.textContent = '0 tamu ditemukan dari filter';
      return;
    }
    dom.emptyState.style.display = 'none';
    dom.showingCountText.textContent = `Menampilkan ${filtered.length} dari ${state.rawRows.length} tamu undangan`;

    filtered.forEach(({ row, originalIndex }) => {
      const tr = document.createElement('tr');
      const isSent = isRowSent(row, originalIndex);
      if (isSent) tr.classList.add('row-is-sent');

      const phoneInfo = normalizePhone(row[state.phoneColumn]);
      const compiledMsg = compileMessage(state.currentTemplate, row);
      const waUrl = phoneInfo.isValid ? generateWaUrl(phoneInfo.formatted, compiledMsg) : '';
      const guestName = (row['Nama'] || row['Name'] || '-').trim();
      const sapaan = (row['Sapaan'] || '').trim();
      const label = (row['Label'] || '').trim();
      const link = (row['Link'] || '').trim();

      // No. cell
      const tdNo = document.createElement('td');
      tdNo.className = 'col-num';
      tdNo.textContent = originalIndex + 1;

      // Status badge
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

      // Name cell
      const tdName = document.createElement('td');
      tdName.className = 'col-name';
      let chips = '';
      if (sapaan) chips += `<span class="meta-chip">${escapeHtml(sapaan)}</span>`;
      if (label) chips += `<span class="meta-chip meta-chip-blue">${escapeHtml(label)}</span>`;
      tdName.innerHTML = `<div class="guest-name-cell"><div class="guest-name-text">${escapeHtml(guestName)}</div>${chips ? `<div class="guest-meta-tags">${chips}</div>` : ''}</div>`;

      // Phone cell
      const tdPhone = document.createElement('td');
      tdPhone.className = 'col-phone phone-cell-text';
      tdPhone.innerHTML = phoneInfo.isValid
        ? `<span class="phone-valid"><i data-lucide="check" style="width:14px;height:14px;"></i> +${escapeHtml(phoneInfo.formatted)}</span>`
        : `<span class="phone-empty"><i data-lucide="phone-off" style="width:12px;height:12px;"></i> Tanpa Nomor</span>`;

      // Link cell
      const tdLink = document.createElement('td');
      tdLink.className = 'col-link';
      tdLink.innerHTML = (link && link.startsWith('http'))
        ? `<a href="${escapeHtml(link)}" target="_blank" class="link-url-text" title="${escapeHtml(link)}">${escapeHtml(link)}</a>`
        : `<span style="color:var(--slate-400);">-</span>`;

      // Actions
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
    state.rawRows.forEach((row, idx) => {
      if (normalizePhone(row[state.phoneColumn]).isValid) withPhone++;
      if (isRowSent(row, idx)) sentCount++;
    });
    const pendingCount = total - sentCount;
    const percentage = total > 0 ? Math.round((sentCount / total) * 100) : 0;
    dom.statTotalGuests.textContent = total;
    dom.statSentCount.textContent = `${sentCount} (${percentage}%)`;
    dom.statPendingCount.textContent = pendingCount;
    dom.statWithPhone.textContent = withPhone;
    dom.progressPercentage.textContent = `${percentage}% (${sentCount}/${total} Terkirim)`;
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
    dom.modalGuestTitle.textContent = `Pesan Undangan: ${sapaan} ${name}`;
    dom.modalGuestInfo.innerHTML = `
      <span class="meta-chip">Tamu #${index + 1}</span>
      <span class="meta-chip ${phoneInfo.isValid ? 'meta-chip-blue' : ''}">${phoneInfo.isValid ? 'WA: +' + phoneInfo.formatted : 'Tanpa Nomor WA'}</span>
      <span class="meta-chip" style="background:${isSent ? '#DCFCE7' : '#F1F5F9'};color:${isSent ? '#166534' : '#475569'};font-weight:700;">${isSent ? 'Sudah Dikirim' : 'Belum Dikirim'}</span>`;
    dom.modalMessageContent.textContent = compiledMsg;
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
    dom.fileInput.addEventListener('change', (e) => { if (e.target.files[0]) processExcelFile(e.target.files[0]); });

    ['dragenter', 'dragover'].forEach(ev => {
      dom.dropzone.addEventListener(ev, (e) => { e.preventDefault(); dom.dropzone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dom.dropzone.addEventListener(ev, (e) => { e.preventDefault(); dom.dropzone.classList.remove('dragover'); });
    });
    dom.dropzone.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) processExcelFile(e.dataTransfer.files[0]); });

    dom.btnReloadDefault.addEventListener('click', loadDefaultExcel);

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
      state.currentTemplate = PRESET_TEMPLATES.formal;
      dom.templatePresetSelect.value = 'formal';
      dom.templateInput.value = state.currentTemplate;
      updateCharCounter();
      updateLivePreview();
      renderTable();
      showToast('Template dikembalikan ke format Formal.', 'success');
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

    dom.btnMarkAllSent.addEventListener('click', async () => {
      const filtered = filterRows();
      if (filtered.length === 0) return;
      for (const { row, originalIndex } of filtered) {
        await setRowSent(row, originalIndex, true);
      }
      renderTable();
      showToast(`${filtered.length} tamu ditandai Sudah Dikirim!`, 'success');
    });

    dom.btnResetAllSent.addEventListener('click', async () => {
      if (!confirm('Reset seluruh status pengiriman ke Belum Dikirim?')) return;
      try {
        await apiDelete('/api/sent-status');
      } catch (e) {
        console.warn('Failed to reset on Supabase', e);
      }
      state.sentStatuses = {};
      renderTable();
      updateStatsAndProgress();
      showToast('Semua status pengiriman berhasil di-reset.', 'success');
    });

    dom.btnCloseModal.addEventListener('click', closeModal);
    dom.previewModal.addEventListener('click', (e) => { if (e.target === dom.previewModal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
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
