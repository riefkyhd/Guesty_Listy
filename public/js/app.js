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
    currentSideFilter: 'all',
    searchQuery: '',
    selectedPreviewIndex: 0,
    sentStatuses: {},
    currentTemplate: '',
    expandedGuestIndex: null
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
    btnOpenActivityLog: document.getElementById('btnOpenActivityLog'),
    activityLogModal: document.getElementById('activityLogModal'),
    btnCloseActivityLogModal: document.getElementById('btnCloseActivityLogModal'),
    btnCloseActivityLogBottom: document.getElementById('btnCloseActivityLogBottom'),
    btnRefreshActivityLog: document.getElementById('btnRefreshActivityLog'),
    activityLogList: document.getElementById('activityLogList'),
    activityLogCount: document.getElementById('activityLogCount'),
    activityLogEmpty: document.getElementById('activityLogEmpty'),
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
    sideDropdownContainer: document.getElementById('sideDropdownContainer'),
    btnSideFilterDropdown: document.getElementById('btnSideFilterDropdown'),
    sideFilterDropdownMenu: document.getElementById('sideFilterDropdownMenu'),
    sideFilterSelectedText: document.getElementById('sideFilterSelectedText'),
    btnMarkAllSent: document.getElementById('btnMarkAllSent'),
    btnResetAllSent: document.getElementById('btnResetAllSent'),
    recipientsTableBody: document.getElementById('recipientsTableBody'),
    recipientsTable: document.getElementById('recipientsTable'),
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
    btnToggleTopConfig: document.getElementById('btnToggleTopConfig'),
    topConfigGrid: document.getElementById('topConfigGrid'),
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
    btnModalDeleteGuest: document.getElementById('btnModalDeleteGuest'),
    // Custom Confirmation Modal
    customConfirmModal: document.getElementById('customConfirmModal'),
    confirmModalIconWrap: document.getElementById('confirmModalIconWrap'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    btnCancelConfirm: document.getElementById('btnCancelConfirm'),
    btnProceedConfirm: document.getElementById('btnProceedConfirm'),
    // Import Preview Modal with Duplicate Detection
    importPreviewModal: document.getElementById('importPreviewModal'),
    btnCloseImportModal: document.getElementById('btnCloseImportModal'),
    btnCancelImport: document.getElementById('btnCancelImport'),
    btnConfirmImport: document.getElementById('btnConfirmImport'),
    btnConfirmImportText: document.getElementById('btnConfirmImportText'),
    importModalTitle: document.getElementById('importModalTitle'),
    importModalSubtitle: document.getElementById('importModalSubtitle'),
    importStatTotal: document.getElementById('importStatTotal'),
    importStatNew: document.getElementById('importStatNew'),
    importStatDup: document.getElementById('importStatDup'),
    importDupAlert: document.getElementById('importDupAlert'),
    importDupAlertCount: document.getElementById('importDupAlertCount'),
    importPreviewTableBody: document.getElementById('importPreviewTableBody'),
    selectAllNewImport: document.getElementById('selectAllNewImport'),
    // PIN Gate
    pinOverlay: document.getElementById('pinOverlay'),
    pinInput: document.getElementById('pinInput'),
    pinError: document.getElementById('pinError'),
    btnUnlock: document.getElementById('btnUnlock'),
    // Sync indicator
    syncDot: document.getElementById('syncDot'),
    syncLabel: document.getElementById('syncLabel'),
    mobileSyncBadge: document.getElementById('mobileSyncBadge'),
    mobileSyncDot: document.getElementById('mobileSyncDot'),
    mobileSyncLabel: document.getElementById('mobileSyncLabel'),
    footerSyncStatus: document.getElementById('footerSyncStatus')
  };

  function setInitialLoading(isLoading) {
    if (isLoading) {
      // 1. Shimmer in Header Metrics
      if (dom.statTotalGuests) dom.statTotalGuests.innerHTML = '<span class="shimmer metric-skeleton"></span>';
      if (dom.statTotalPax) {
        dom.statTotalPax.classList.add('has-skeleton');
        dom.statTotalPax.innerHTML = '<span class="shimmer metric-sub-skeleton"></span>';
      }
      if (dom.statSentCount) dom.statSentCount.innerHTML = '<span class="shimmer metric-skeleton metric-skeleton-wide"></span>';
      if (dom.statSentPax) {
        dom.statSentPax.classList.add('has-skeleton');
        dom.statSentPax.innerHTML = '<span class="shimmer metric-sub-skeleton"></span>';
      }
      if (dom.statPendingCount) dom.statPendingCount.innerHTML = '<span class="shimmer metric-skeleton"></span>';
      if (dom.statPendingPax) {
        dom.statPendingPax.classList.add('has-skeleton');
        dom.statPendingPax.innerHTML = '<span class="shimmer metric-sub-skeleton"></span>';
      }

      // 2. Shimmer in Table Toolbar / Counter
      if (dom.showingCountText) {
        dom.showingCountText.innerHTML = '<span class="shimmer" style="width: 150px; height: 14px; border-radius: 4px; display: inline-block;"></span>';
      }

      // 3. Shimmer in Live Preview Bubble (4 subtle flowing lines)
      if (dom.livePreviewBubble) {
        dom.livePreviewBubble.innerHTML = `
          <div class="preview-skeleton-wrap">
            <span class="shimmer preview-skeleton-line" style="width: 82%;"></span>
            <span class="shimmer preview-skeleton-line" style="width: 60%;"></span>
            <span class="shimmer preview-skeleton-line" style="width: 90%;"></span>
            <span class="shimmer preview-skeleton-line" style="width: 45%;"></span>
            <div class="preview-skeleton-meta">
              <span class="shimmer" style="width: 38px; height: 10px; border-radius: 4px;"></span>
            </div>
          </div>`;
      }

      // 4. Shimmer in Desktop Table (5 skeleton placeholder rows)
      if (dom.recipientsTableBody) {
        dom.recipientsTableBody.innerHTML = Array(5).fill(0).map(() => `
          <tr class="table-skeleton-row">
            <td class="col-num"><span class="shimmer skeleton-badge" style="width: 24px;"></span></td>
            <td class="col-status"><span class="shimmer skeleton-pill" style="width: 92px;"></span></td>
            <td class="col-name">
              <div class="skeleton-cell-name">
                <span class="shimmer skeleton-title" style="width: 130px;"></span>
                <span class="shimmer skeleton-text" style="width: 70px;"></span>
              </div>
            </td>
            <td class="col-phone"><span class="shimmer skeleton-text" style="width: 110px;"></span></td>
            <td class="col-link"><span class="shimmer skeleton-text" style="width: 140px;"></span></td>
            <td class="col-actions">
              <div class="skeleton-cell-actions">
                <span class="shimmer skeleton-badge" style="width: 65px; height: 30px; border-radius: 8px;"></span>
                <span class="shimmer skeleton-badge" style="width: 65px; height: 30px; border-radius: 8px;"></span>
              </div>
            </td>
          </tr>
        `).join('');
      }

      // 5. Shimmer in Mobile Cards (4 skeleton cards)
      if (dom.mobileCardsList) {
        dom.mobileCardsList.innerHTML = Array(4).fill(0).map(() => `
          <div class="mobile-skeleton-card">
            <div class="mobile-skeleton-header">
              <div class="mobile-skeleton-left">
                <span class="shimmer skeleton-title" style="width: 140px;"></span>
                <span class="shimmer skeleton-text" style="width: 70px;"></span>
              </div>
              <div class="mobile-skeleton-right">
                <span class="shimmer skeleton-pill" style="width: 65px;"></span>
                <span class="shimmer skeleton-circle" style="width: 16px; height: 16px;"></span>
              </div>
            </div>
          </div>
        `).join('');
      }

      if (dom.emptyState) dom.emptyState.style.display = 'none';
      if (dom.recipientsTable) dom.recipientsTable.style.display = '';
      if (dom.mobileCardsList) dom.mobileCardsList.style.display = '';
    } else {
      if (state.rawRows.length === 0) {
        if (dom.recipientsTableBody) dom.recipientsTableBody.innerHTML = '';
        if (dom.mobileCardsList) dom.mobileCardsList.innerHTML = '';
        if (dom.emptyState) dom.emptyState.style.display = 'block';
        if (dom.showingCountText) dom.showingCountText.textContent = 'Menampilkan 0 undangan';
      }
    }
  }

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

    dom.confirmModalIconWrap.innerHTML = `<i data-lucide="${icon}" id="confirmModalIcon"></i>`;
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
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
  }

  function parseWhatsAppFormatting(text) {
    if (!text) return '';
    const clean = decodeHtmlEntities(text.trim());
    let escaped = escapeHtml(clean);

    // Monospace ```code```
    escaped = escaped.replace(/```([\s\S]+?)```/g, '<code>$1</code>');

    // Bold *bold* - matches *text* surrounded by start/end/non-word characters
    escaped = escaped.replace(/(^|[^\w*])\*([^*\r\n]+?)\*(?=[^\w*]|$)/g, '$1<strong>$2</strong>');

    // Italic _italic_
    escaped = escaped.replace(/(^|[^\w_])_([^_\r\n]+?)_(?=[^\w_]|$)/g, '$1<em>$2</em>');

    // Strikethrough ~strike~
    escaped = escaped.replace(/(^|[^\w~])~([^~\r\n]+?)~(?=[^\w~]|$)/g, '$1<del>$2</del>');

    // Auto-link URLs
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    escaped = escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="wa-link">$1</a>');

    // Clean up excessive newlines (max 2 consecutive line breaks)
    escaped = escaped.replace(/(\r?\n){3,}/g, '\n\n');

    // Convert newlines to <br>
    escaped = escaped.replace(/\r?\n/g, '<br>');
    return escaped.trim();
  }

  // ===========================================================================
  // Sync Indicator
  // ===========================================================================
  function setSyncStatus(status) {
    const states = {
      connecting: { dot: 'sync-dot-connecting', label: 'Menghubungkan...', footer: '🔵 Menghubungkan' },
      live: { dot: 'sync-dot-live', label: 'Realtime Aktif', footer: 'Sinkronisasi aktif 🟢' },
      disconnected: { dot: 'sync-dot-offline', label: 'Cloud Tersimpan', footer: '🟢 Cloud Tersimpan (Polling)' }
    };
    const s = states[status] || states.disconnected;
    if (dom.syncDot) dom.syncDot.className = `sync-dot ${s.dot}`;
    if (dom.syncLabel) dom.syncLabel.textContent = s.label;
    if (dom.mobileSyncDot) dom.mobileSyncDot.className = `sync-dot ${s.dot}`;
    if (dom.mobileSyncLabel) dom.mobileSyncLabel.textContent = s.label;
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

  async function apiPut(path, body) {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`${path} PUT failed: ${res.status}`);
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

  function getGuestNameByKey(guestKey) {
    if (!guestKey || !state.rawRows) return '';
    for (let i = 0; i < state.rawRows.length; i++) {
      if (getRowKey(state.rawRows[i], i) === guestKey) {
        return (state.rawRows[i]['Nama'] || state.rawRows[i]['Name'] || '').trim();
      }
    }
    return '';
  }

  function highlightRealtimeRow(guestKey) {
    if (!guestKey) return;
    try {
      const elements = document.querySelectorAll(`[data-key="${CSS.escape(guestKey)}"]`);
      elements.forEach(el => {
        el.classList.remove('realtime-pulse-target');
        void el.offsetWidth;
        el.classList.add('realtime-pulse-target');
        setTimeout(() => el.classList.remove('realtime-pulse-target'), 2600);
      });
    } catch (e) {
      console.warn('Highlight failed:', e);
    }
  }

  async function logActivity({ action, summary, details }) {
    try {
      await apiPost('/api/logs', {
        action,
        summary,
        details: details || {}
      });
      broadcastRealtimeEvent('activity_logged', { action, summary });
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }
  }

  async function setRowSent(row, index, isSent) {
    const key = getRowKey(row, index);
    const guestName = (row['Nama'] || row['Name'] || 'Tamu').trim();
    if (isSent) { state.sentStatuses[key] = true; } else { delete state.sentStatuses[key]; }
    updateStatsAndProgress();
    broadcastRealtimeEvent('status_updated', { guestKey: key, isSent, guestName });
    await persistSentStatus(key, isSent);
    logActivity({
      action: isSent ? 'STATUS_SENT' : 'STATUS_PENDING',
      summary: `"${guestName}" ditandai ${isSent ? 'Sudah Kirim' : 'Belum Kirim'}`,
      details: { guestKey: key, guestName, isSent }
    });
  }

  // ===========================================================================
  // Supabase Realtime Subscription & Multi-Device Sync
  // ===========================================================================
  let realtimeChannel = null;
  let realtimePollingTimer = null;
  let isSyncingFromCloud = false;

  function broadcastRealtimeEvent(event, payload = {}) {
    if (realtimeChannel && typeof realtimeChannel.send === 'function') {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event: event,
          payload: payload
        });
      } catch (err) {
        console.warn('Realtime broadcast error:', err);
      }
    }
  }

  async function reloadGuestsAndStatusesFromCloud() {
    if (isSyncingFromCloud) return;
    isSyncingFromCloud = true;
    try {
      // 1. Fetch latest guests from cloud
      const guestsRes = await apiGet('/api/guests');
      const guests = guestsRes.guests;
      if (Array.isArray(guests)) {
        const newRows = guests.map(g => g.raw_data);
        const currentJson = JSON.stringify(state.rawRows);
        const newJson = JSON.stringify(newRows);
        if (currentJson !== newJson) {
          state.rawRows = newRows;
          if (newRows.length > 0) {
            state.columns = Object.keys(newRows[0] || {});
            state.phoneColumn = detectPhoneColumn(state.columns);
          }
          if (state.selectedPreviewIndex >= state.rawRows.length) {
            state.selectedPreviewIndex = Math.max(0, state.rawRows.length - 1);
          }
          if (state.expandedGuestIndex !== null && state.expandedGuestIndex >= state.rawRows.length) {
            state.expandedGuestIndex = null;
          }
          updateFileStatusBar(null, state.rawRows.length);
          populatePreviewGuestDropdown();
          renderTable();
          updateStatsAndProgress();
          updateLivePreview();
        }
      }

      // 2. Fetch latest sent statuses from cloud
      const statusRes = await apiGet('/api/sent-status');
      if (statusRes && statusRes.sentStatuses) {
        const currentStatusesJson = JSON.stringify(state.sentStatuses);
        const newStatusesJson = JSON.stringify(statusRes.sentStatuses);
        if (currentStatusesJson !== newStatusesJson) {
          state.sentStatuses = statusRes.sentStatuses;
          updateStatsAndProgress();
          renderTable();
        }
      }
    } catch (e) {
      console.warn('Cloud sync error:', e);
    } finally {
      isSyncingFromCloud = false;
    }
  }

  function startFallbackPolling(interval = 5000) {
    if (realtimePollingTimer) {
      clearInterval(realtimePollingTimer);
      realtimePollingTimer = null;
    }
    realtimePollingTimer = setInterval(async () => {
      try {
        await reloadGuestsAndStatusesFromCloud();
      } catch (e) {}
    }, interval);
  }

  function stopFallbackPolling() {
    if (realtimePollingTimer) {
      clearInterval(realtimePollingTimer);
      realtimePollingTimer = null;
    }
  }

  function setupRealtime() {
    const sb = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    if (!sb) {
      setSyncStatus('disconnected');
      startFallbackPolling(5000);
      return;
    }

    setSyncStatus('connecting');

    // Clean up existing channel if reconnecting
    if (realtimeChannel) {
      try { sb.removeChannel(realtimeChannel); } catch (e) {}
      realtimeChannel = null;
    }

    realtimeChannel = sb.channel('guesty-realtime-sync', {
      config: {
        broadcast: { self: false }
      }
    });

    // A. Listen for Instant Multi-Device Broadcast Events
    realtimeChannel
      .on('broadcast', { event: 'guest_list_updated' }, async () => {
        await reloadGuestsAndStatusesFromCloud();
        showToast('👥 Daftar tamu diperbarui secara realtime', 'info');
      })
      .on('broadcast', { event: 'status_updated' }, (msg) => {
        const data = msg.payload || msg;
        if (data && data.guestKey) {
          if (data.isSent) {
            state.sentStatuses[data.guestKey] = true;
          } else {
            delete state.sentStatuses[data.guestKey];
          }
          updateStatsAndProgress();
          renderTable();
          const guestName = data.guestName || getGuestNameByKey(data.guestKey) || 'Tamu';
          showToast(data.isSent ? `🟢 '${guestName}' ditandai Sudah Kirim` : `⏳ '${guestName}' diubah ke Belum Kirim`, 'success');
          highlightRealtimeRow(data.guestKey);
        }
      })
      .on('broadcast', { event: 'bulk_status_updated' }, (msg) => {
        const data = msg.payload || msg;
        if (data && data.sentStatuses) {
          state.sentStatuses = data.sentStatuses;
          updateStatsAndProgress();
          renderTable();
          const isReset = Object.keys(data.sentStatuses).length === 0;
          showToast(isReset ? '🔄 Status pengiriman di-reset secara realtime' : '🟢 Status pengiriman diperbarui secara massal', 'success');
        }
      })
      .on('broadcast', { event: 'template_updated' }, (msg) => {
        const data = msg.payload || msg;
        if (data && data.template && state.currentTemplate !== data.template) {
          state.currentTemplate = data.template;
          dom.templatePresetSelect.value = 'custom';
          dom.templateInput.value = data.template;
          updateCharCounter();
          updateLivePreview();
          showToast('📝 Template pesan kustom diperbarui secara realtime', 'info');
        }
      })
      .on('broadcast', { event: 'activity_logged' }, () => {
        if (dom.activityLogModal && dom.activityLogModal.style.display !== 'none') {
          loadActivityLogs();
        }
      });

    // B. Listen for Postgres CDC Changes on guests table
    realtimeChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'guests'
      }, async () => {
        await reloadGuestsAndStatusesFromCloud();
      });

    // C. Listen for Postgres CDC Changes on sent_statuses table
    realtimeChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sent_statuses'
      }, (payload) => {
        const { new: newRow, old: oldRow, eventType } = payload;
        if (eventType === 'DELETE' && oldRow?.guest_key) {
          delete state.sentStatuses[oldRow.guest_key];
        } else if (newRow?.guest_key) {
          if (newRow.is_sent) {
            state.sentStatuses[newRow.guest_key] = true;
          } else {
            delete state.sentStatuses[newRow.guest_key];
          }
        }
        updateStatsAndProgress();
        renderTable();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      }, () => {
        if (dom.activityLogModal && dom.activityLogModal.style.display !== 'none') {
          loadActivityLogs();
        }
      });

    // D. Channel status subscription
    realtimeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setSyncStatus('live');
        // Live websocket active: maintain 20s background safety poll
        startFallbackPolling(20000);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setSyncStatus('disconnected');
        // WebSockets down: switch to 5s active polling
        startFallbackPolling(5000);
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
      broadcastRealtimeEvent('guest_list_updated', { action: 'update', count: rows.length });
    } catch (e) {
      console.warn('Failed to save guests to Supabase', e);
    }
  }

  // ===========================================================================
  // Delete Guest with Custom Confirmation Modal
  // ===========================================================================
  function confirmDeleteGuest(index) {
    if (index < 0 || index >= state.rawRows.length) return;
    const row = state.rawRows[index];
    const guestName = (row['Nama'] || row['Name'] || `Tamu #${index + 1}`).trim();

    showCustomConfirm({
      title: 'Hapus Tamu',
      message: `Apakah Anda yakin ingin menghapus "${guestName}" dari daftar undangan? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'trash-2',
      theme: 'danger',
      confirmText: 'Ya, Hapus Tamu',
      cancelText: 'Batal',
      onConfirm: async () => {
        await deleteGuestAtIndex(index, guestName);
      }
    });
  }

  async function deleteGuestAtIndex(index, guestName) {
    if (index < 0 || index >= state.rawRows.length) return;

    // Preserve isSent status for each row
    const isSentArray = state.rawRows.map((r, i) => isRowSent(r, i));

    // Remove row
    state.rawRows.splice(index, 1);
    isSentArray.splice(index, 1);

    // Rebuild sentStatuses mapped to new shifted row keys
    const newSentStatuses = {};
    state.rawRows.forEach((r, i) => {
      if (isSentArray[i]) {
        newSentStatuses[getRowKey(r, i)] = true;
      }
    });
    state.sentStatuses = newSentStatuses;

    // Adjust expanded index if mobile card was expanded
    if (state.expandedGuestIndex === index) {
      state.expandedGuestIndex = null;
    } else if (state.expandedGuestIndex !== null && state.expandedGuestIndex > index) {
      state.expandedGuestIndex--;
    }

    // Adjust preview selection if deleted guest was selected
    if (state.selectedPreviewIndex >= state.rawRows.length) {
      state.selectedPreviewIndex = Math.max(0, state.rawRows.length - 1);
    }

    // Persist changes to Supabase
    try {
      await saveGuestsToSupabase(state.rawRows);
      await apiPut('/api/sent-status', { sentStatuses: state.sentStatuses });
    } catch (e) {
      console.warn('Failed to sync guest deletion to cloud', e);
    }

    // Broadcast updates to all other connected devices instantly
    broadcastRealtimeEvent('guest_list_updated', { action: 'delete', name: guestName, count: state.rawRows.length });
    broadcastRealtimeEvent('bulk_status_updated', { sentStatuses: state.sentStatuses });

    logActivity({
      action: 'GUEST_DELETED',
      summary: `Menghapus tamu "${guestName}" dari daftar undangan`,
      details: { guestName }
    });

    // Update UI components
    updateFileStatusBar(null, state.rawRows.length);
    populatePreviewGuestDropdown();
    renderTable();
    updateStatsAndProgress();
    updateLivePreview();

    showToast(`Tamu "${guestName}" berhasil dihapus.`, 'success');
  }

  function loadDefaultExcelDirectly() {
    return fetch('/api/default-excel')
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
        }
      })
      .catch(err => console.warn('Could not auto-load default Excel directly:', err));
  }

  function loadDefaultExcel() {
    return fetch('/api/default-excel')
      .then(res => {
        if (!res.ok) throw new Error('Default Excel not found');
        return res.arrayBuffer();
      })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rows && rows.length > 0) {
          openImportPreviewModal(rows, 'invitation_list_36032.xlsx (Bawaan)');
        }
      })
      .catch(err => {
        console.warn('Could not load default Excel:', err);
        showToast('Gagal memuat template Excel bawaan.', 'danger');
      });
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
          showToast('File Excel kosong atau tidak memiliki data baris.', 'danger');
          return;
        }
        openImportPreviewModal(rows, file.name);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        showToast('Gagal membaca file Excel. Pastikan format valid.', 'danger');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ===========================================================================
  // Excel Import Preview Modal with Non-Destructive Duplicate Detection
  // ===========================================================================
  let pendingImportItems = [];
  let pendingImportFilename = '';

  function openImportPreviewModal(incomingRows, filename) {
    if (!incomingRows || incomingRows.length === 0) {
      showToast('File Excel kosong atau tidak memiliki data.', 'danger');
      return;
    }

    pendingImportFilename = filename || 'Data Excel';

    // Map existing guest names strictly by name (case-insensitive & trimmed)
    const existingNamesSet = new Set();
    state.rawRows.forEach(r => {
      const name = (r['Nama'] || r['Name'] || '').toString().trim().toLowerCase();
      if (name) existingNamesSet.add(name);
    });

    const seenInIncomingBatch = new Set();
    const phoneCol = detectPhoneColumn(Object.keys(incomingRows[0] || {}));

    pendingImportItems = incomingRows.map((row, idx) => {
      const rawName = (row['Nama'] || row['Name'] || '').toString().trim();
      const lowerName = rawName.toLowerCase();
      const isAlreadyInList = lowerName ? existingNamesSet.has(lowerName) : false;
      const isDuplicateInBatch = lowerName ? seenInIncomingBatch.has(lowerName) : false;
      const isDuplicate = isAlreadyInList || isDuplicateInBatch;

      if (!isDuplicate && lowerName) {
        seenInIncomingBatch.add(lowerName);
      }

      const side = getGuestSide(row);
      const note = getGuestNote(row);
      const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;
      const phoneInfo = normalizePhone(row[phoneCol]);

      return {
        row,
        index: idx,
        name: rawName || `Tamu #${idx + 1}`,
        isDuplicate,
        duplicateReason: isAlreadyInList ? 'Sudah ada di daftar tamu' : (isDuplicateInBatch ? 'Duplikat dalam file Excel ini' : ''),
        side,
        note,
        pax,
        phoneInfo,
        selected: !isDuplicate // New guests checked by default, duplicates unchecked
      };
    });

    renderImportPreviewModal();
  }

  function renderImportPreviewModal() {
    const totalCount = pendingImportItems.length;
    const newItems = pendingImportItems.filter(i => !i.isDuplicate);
    const dupItems = pendingImportItems.filter(i => i.isDuplicate);
    const selectedNewCount = pendingImportItems.filter(i => i.selected && !i.isDuplicate).length;

    dom.importModalTitle.textContent = 'Preview Impor Data Excel';
    dom.importModalSubtitle.textContent = `File: ${pendingImportFilename} (${totalCount} baris terdeteksi)`;

    dom.importStatTotal.textContent = totalCount;
    dom.importStatNew.textContent = newItems.length;
    dom.importStatDup.textContent = dupItems.length;

    if (dupItems.length > 0) {
      dom.importDupAlert.style.display = 'flex';
      dom.importDupAlertCount.textContent = dupItems.length;
    } else {
      dom.importDupAlert.style.display = 'none';
    }

    if (dom.selectAllNewImport) {
      dom.selectAllNewImport.checked = newItems.length > 0 && selectedNewCount === newItems.length;
      dom.selectAllNewImport.disabled = newItems.length === 0;
    }

    updateConfirmImportButton();

    // Render Rows in Import Table
    dom.importPreviewTableBody.innerHTML = '';
    pendingImportItems.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.className = item.isDuplicate ? 'import-row-dup' : 'import-row-new';

      // Checkbox
      const tdCheck = document.createElement('td');
      tdCheck.className = 'import-col-check';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'import-checkbox';
      chk.checked = item.selected;
      chk.disabled = item.isDuplicate; // duplicate cannot be checked (skipped automatically)
      if (item.isDuplicate) {
        chk.title = 'Tamu duplikat dilewati secara otomatis agar tidak menimpa data yang ada';
      } else {
        chk.title = 'Pilih untuk menambahkan tamu ini';
        chk.addEventListener('change', () => {
          item.selected = chk.checked;
          const currentSelected = pendingImportItems.filter(i => i.selected && !i.isDuplicate).length;
          if (dom.selectAllNewImport) {
            dom.selectAllNewImport.checked = currentSelected === newItems.length;
          }
          updateConfirmImportButton();
        });
      }
      tdCheck.appendChild(chk);

      // No
      const tdNo = document.createElement('td');
      tdNo.className = 'import-col-num';
      tdNo.textContent = idx + 1;

      // Status Impor
      const tdStatus = document.createElement('td');
      tdStatus.className = 'import-col-status';
      if (item.isDuplicate) {
        tdStatus.innerHTML = `<span class="badge-import-dup" title="${escapeHtml(item.duplicateReason)}"><i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> Duplikat</span>`;
      } else {
        tdStatus.innerHTML = `<span class="badge-import-new"><i data-lucide="check" style="width:12px;height:12px;"></i> Baru</span>`;
      }

      // Nama Tamu
      const tdName = document.createElement('td');
      tdName.innerHTML = `<span class="import-guest-name">${escapeHtml(item.name)}</span>`;
      if (item.isDuplicate) {
        tdName.innerHTML += `<div style="font-size:0.72rem;color:#b45309;margin-top:2px;">⚠️ ${escapeHtml(item.duplicateReason)}</div>`;
      }

      // Pihak / Catatan
      const tdSide = document.createElement('td');
      tdSide.className = 'import-col-side';
      const importSideBadge = getSideBadgeHtml(item.side);
      tdSide.innerHTML = importSideBadge || `<span style="color:var(--slate-400);">-</span>`;

      // Pax
      const tdPax = document.createElement('td');
      tdPax.className = 'import-col-pax';
      tdPax.innerHTML = `<span class="meta-chip meta-chip-blue">👥 ${item.pax}</span>`;

      // Phone
      const tdPhone = document.createElement('td');
      tdPhone.className = 'import-col-phone';
      tdPhone.innerHTML = item.phoneInfo.isValid
        ? `<span class="phone-valid">+${escapeHtml(item.phoneInfo.formatted)}</span>`
        : `<span style="color:var(--slate-400);font-size:0.75rem;">Tanpa WA</span>`;

      // Catatan
      const tdNote = document.createElement('td');
      tdNote.innerHTML = item.note ? `<span style="font-size:0.78rem;color:var(--slate-600);">${escapeHtml(item.note)}</span>` : `<span style="color:var(--slate-400);">-</span>`;

      tr.appendChild(tdCheck);
      tr.appendChild(tdNo);
      tr.appendChild(tdStatus);
      tr.appendChild(tdName);
      tr.appendChild(tdSide);
      tr.appendChild(tdPax);
      tr.appendChild(tdPhone);
      tr.appendChild(tdNote);
      dom.importPreviewTableBody.appendChild(tr);
    });

    dom.importPreviewModal.style.display = 'flex';
    setupLucideIcons();
  }

  function updateConfirmImportButton() {
    const selectedNewCount = pendingImportItems.filter(i => i.selected && !i.isDuplicate).length;
    dom.btnConfirmImport.disabled = selectedNewCount === 0;
    if (dom.btnConfirmImportText) {
      dom.btnConfirmImportText.textContent = selectedNewCount > 0
        ? `Konfirmasi Tambahkan (${selectedNewCount} Tamu Baru)`
        : 'Tidak Ada Tamu Baru Dipilih';
    }
  }

  function closeImportPreviewModal() {
    dom.importPreviewModal.style.display = 'none';
    pendingImportItems = [];
    if (dom.fileInput) dom.fileInput.value = '';
  }

  async function confirmAndAppendNewGuests() {
    const itemsToAdd = pendingImportItems.filter(i => i.selected && !i.isDuplicate);
    if (itemsToAdd.length === 0) {
      showToast('Tidak ada tamu baru yang dipilih untuk ditambahkan.', 'danger');
      closeImportPreviewModal();
      return;
    }

    const dupCount = pendingImportItems.filter(i => i.isDuplicate).length;
    const newRows = itemsToAdd.map(i => i.row);

    // NON-DESTRUCTIVE APPEND: existing guests are completely preserved!
    state.rawRows = [...state.rawRows, ...newRows];

    // Merge columns to ensure any new columns from the new Excel are included
    if (newRows.length > 0 && Object.keys(newRows[0] || {}).length > 0) {
      const existingCols = new Set(state.columns);
      Object.keys(newRows[0]).forEach(c => existingCols.add(c));
      state.columns = Array.from(existingCols);
      if (!state.phoneColumn) state.phoneColumn = detectPhoneColumn(state.columns);
      populatePhoneColSelector();
      renderTagChips();
    }

    // Save updated full list to Supabase
    await saveGuestsToSupabase(state.rawRows);

    // Broadcast realtime event to all connected devices
    broadcastRealtimeEvent('guest_list_updated', {
      action: 'import',
      count: state.rawRows.length,
      added: newRows.length
    });

    logActivity({
      action: 'GUESTS_IMPORTED',
      summary: `Menambahkan ${newRows.length} tamu baru dari file Excel`,
      details: { count: newRows.length, fileName: pendingImportFilename }
    });

    closeImportPreviewModal();

    // Re-render UI
    updateFileStatusBar(pendingImportFilename, state.rawRows.length);
    populatePreviewGuestDropdown();
    renderTable();
    updateStatsAndProgress();
    updateLivePreview();

    showToast(`Berhasil menambahkan ${newRows.length} tamu baru! (${dupCount} duplikat dilewati)`, 'success');
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
    if (filename) dom.loadedFileName.textContent = filename;
    dom.loadedFileDetails.textContent = `${count} Tamu Undangan terdeteksi`;
  }

  function populatePhoneColSelector() {
    if (!state.phoneColumn && state.columns.length > 0) {
      state.phoneColumn = detectPhoneColumn(state.columns);
    }
    if (!dom.phoneColSelect) return;
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

  function getSideBadgeHtml(side) {
    if (side === 'dhifa') return `<span class="meta-chip meta-chip-dhifa">🌸 Dhifa</span>`;
    if (side === 'riefky') return `<span class="meta-chip meta-chip-riefky">💼 Riefky</span>`;
    if (side === 'abi') return `<span class="meta-chip meta-chip-abi">🧔 Abi</span>`;
    if (side === 'umi') return `<span class="meta-chip meta-chip-umi">🧕 Umi</span>`;
    if (side === 'papa') return `<span class="meta-chip meta-chip-papa">👨 Papa</span>`;
    if (side === 'mama') return `<span class="meta-chip meta-chip-mama">👩 Mama</span>`;
    return '';
  }

  function getGuestNote(row) {
    if (!row) return '';
    return (row['Catatan'] || row['catatan'] || row['Notes'] || row['notes'] || row['Note'] || row['note'] || row['Keterangan'] || row['keterangan'] || '').toString().trim();
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
    const formattedHtml = parseWhatsAppFormatting(compiled);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    dom.livePreviewBubble.innerHTML = `<div class="wa-msg-text">${formattedHtml || '<em>(Pesan kosong)</em>'}</div><div class="wa-meta-time"><span>${timeStr}</span><span class="wa-ticks">✓✓</span></div>`;
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
      if (dom.emptyState) dom.emptyState.style.display = 'block';
      if (dom.showingCountText) dom.showingCountText.textContent = 'Menampilkan 0 undangan';
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
      tr.dataset.key = getRowKey(row, originalIndex);
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

      const side = getGuestSide(row);
      const note = getGuestNote(row);

      const tdName = document.createElement('td');
      tdName.className = 'col-name';
      let chips = '';
      chips += `<span class="meta-chip meta-chip-blue">👥 ${pax} Tamu</span>`;
      const sideBadge = getSideBadgeHtml(side);
      if (sideBadge) chips += sideBadge;
      if (label && label !== '-' && label !== '--') chips += `<span class="meta-chip">${escapeHtml(label)}</span>`;
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

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-delete-row';
      btnDelete.innerHTML = `<i data-lucide="trash-2" style="width:14px;height:14px;"></i>`;
      btnDelete.title = `Hapus ${guestName}`;
      btnDelete.addEventListener('click', () => confirmDeleteGuest(originalIndex));

      actionsWrapper.appendChild(btnSend);
      actionsWrapper.appendChild(btnCopyLink);
      actionsWrapper.appendChild(btnCopyMsg);
      actionsWrapper.appendChild(btnView);
      actionsWrapper.appendChild(btnDelete);
      tdActions.appendChild(actionsWrapper);

      tr.appendChild(tdNo);
      tr.appendChild(tdStatus);
      tr.appendChild(tdName);
      tr.appendChild(tdPhone);
      tr.appendChild(tdLink);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);

      // 2. Native Mobile Touch Card with Smooth Single-Accordion
      if (dom.mobileCardsList) {
        const isExpanded = state.expandedGuestIndex === originalIndex;
        const card = document.createElement('div');
        card.className = `mobile-guest-card ${isSent ? 'card-sent' : ''} ${isExpanded ? 'is-expanded' : ''}`;
        card.dataset.index = originalIndex;
        card.dataset.key = getRowKey(row, originalIndex);

        card.innerHTML = `
          <div class="mobile-guest-row-header" role="button" tabindex="0" aria-expanded="${isExpanded}">
            <div class="mobile-guest-header-main">
              <div class="mobile-guest-title-row">
                <span class="mobile-guest-num">#${originalIndex + 1}</span>
                <span class="mobile-guest-name">${escapeHtml(guestName)}</span>
              </div>
              <div class="mobile-guest-sub-row">
                <span class="mobile-pax-badge"><i data-lucide="users" style="width:11px;height:11px;"></i> ${pax} Tamu</span>
                ${side === 'dhifa' ? `<span class="mobile-side-badge side-dhifa">🌸 Dhifa</span>` : (side === 'riefky' ? `<span class="mobile-side-badge side-riefky">💼 Riefky</span>` : '')}
                ${label ? `<span class="mobile-category-badge">${escapeHtml(label)}</span>` : ''}
              </div>
            </div>
            <div class="mobile-guest-header-actions">
              <button type="button" class="mobile-status-pill ${isSent ? 'status-sent' : 'status-pending'}" title="Klik untuk ubah status kirim">
                <i data-lucide="${isSent ? 'check-circle-2' : 'clock'}" style="width:11px;height:11px;"></i>
                <span>${isSent ? 'Terkirim' : 'Belum'}</span>
              </button>
              <span class="mobile-chevron-wrap">
                <i data-lucide="chevron-down" class="mobile-chevron-icon" style="width:16px;height:16px;"></i>
              </span>
            </div>
          </div>

          <div class="mobile-guest-drawer">
            <div class="mobile-drawer-inner">
              <div class="mobile-drawer-meta">
                ${side ? `<div class="mobile-meta-item"><strong>Pihak:</strong> ${getSideBadgeHtml(side)}</div>` : ''}
                ${label ? `<div class="mobile-meta-item"><strong>Kategori:</strong> ${escapeHtml(label)}</div>` : ''}
                ${note ? `<div class="mobile-meta-item"><strong>Catatan:</strong> ${escapeHtml(note)}</div>` : ''}
                <div class="mobile-meta-item">
                  <strong>Nomor WA:</strong> ${phoneInfo.isValid ? '+' + escapeHtml(phoneInfo.formatted) : '<em style="color:#94a3b8">Tanpa WhatsApp</em>'}
                </div>
                ${(link && link.startsWith('http')) ? `
                  <div class="mobile-meta-item">
                    <strong>Undangan:</strong> <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="mobile-meta-link">${escapeHtml(link)}</a>
                  </div>
                ` : ''}
              </div>

              <div class="mobile-drawer-actions">
                <button type="button" class="btn btn-primary btn-sm btn-drawer-send ${!phoneInfo.isValid ? 'btn-action-disabled' : ''}">
                  <i data-lucide="send"></i> Buka WA
                </button>
                <div class="mobile-drawer-actions-secondary">
                  <button type="button" class="btn btn-outline btn-sm btn-drawer-preview">
                    <i data-lucide="eye"></i> Preview
                  </button>
                  <button type="button" class="btn btn-outline-danger btn-sm btn-drawer-delete">
                    <i data-lucide="trash-2"></i> Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Click anywhere on row header to expand/collapse (smooth accordion with viewport anchor)
        const rowHeader = card.querySelector('.mobile-guest-row-header');
        rowHeader.addEventListener('click', (e) => {
          if (e.target.closest('.mobile-status-pill')) return;
          toggleMobileCard(card, originalIndex);
        });

        rowHeader.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileCard(card, originalIndex);
          }
        });

        // Quick status toggle directly on pill
        const statusBtn = card.querySelector('.mobile-status-pill');
        statusBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const next = !isRowSent(row, originalIndex);
          await setRowSent(row, originalIndex, next);
          renderTable();
          showToast(next ? `${guestName} ditandai Sudah Dikirim!` : `${guestName} ditandai Belum Dikirim.`, 'success');
        });

        // Drawer buttons
        const btnPrev = card.querySelector('.btn-drawer-preview');
        btnPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          openPreviewModal(row, originalIndex, compiledMsg, waUrl, phoneInfo);
        });

        const btnDeleteMobile = card.querySelector('.btn-drawer-delete');
        if (btnDeleteMobile) {
          btnDeleteMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteGuest(originalIndex);
          });
        }

        const btnSend = card.querySelector('.btn-drawer-send');
        if (phoneInfo.isValid) {
          btnSend.addEventListener('click', async (e) => {
            e.stopPropagation();
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

  function toggleMobileCard(targetCard, index) {
    const isCurrentlyExpanded = targetCard.classList.contains('is-expanded');
    const initialTop = targetCard.getBoundingClientRect().top;

    if (isCurrentlyExpanded) {
      targetCard.classList.remove('is-expanded');
      targetCard.querySelector('.mobile-guest-row-header')?.setAttribute('aria-expanded', 'false');
      state.expandedGuestIndex = null;
    } else {
      // Single accordion mode: close any other open card
      const prevExpanded = dom.mobileCardsList.querySelector('.mobile-guest-card.is-expanded');
      if (prevExpanded && prevExpanded !== targetCard) {
        prevExpanded.classList.remove('is-expanded');
        prevExpanded.querySelector('.mobile-guest-row-header')?.setAttribute('aria-expanded', 'false');
      }

      targetCard.classList.add('is-expanded');
      targetCard.querySelector('.mobile-guest-row-header')?.setAttribute('aria-expanded', 'true');
      state.expandedGuestIndex = index;

      // Smart Viewport Anchor: compensate if previous card collapsed above
      requestAnimationFrame(() => {
        const newTop = targetCard.getBoundingClientRect().top;
        const delta = newTop - initialTop;
        if (Math.abs(delta) > 1) {
          window.scrollBy({ top: delta, behavior: 'instant' });
        }

        // Ensure newly revealed action buttons are visible within viewport
        setTimeout(() => {
          const rect = targetCard.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const navOffset = 64;
          const bottomMargin = 16;

          if (rect.bottom > viewportHeight - bottomMargin) {
            const neededScroll = rect.bottom - (viewportHeight - bottomMargin);
            const maxScroll = Math.max(0, rect.top - navOffset);
            const scrollByAmount = Math.min(neededScroll, maxScroll);
            if (scrollByAmount > 2) {
              window.scrollBy({ top: scrollByAmount, behavior: 'smooth' });
            }
          }
        }, 150);
      });
    }
  }

  function filterRows() {
    const q = state.searchQuery.toLowerCase().trim();
    const filter = state.currentFilter;
    const sideFilter = state.currentSideFilter || 'all';

    return state.rawRows.map((row, originalIndex) => ({ row, originalIndex })).filter(({ row, originalIndex }) => {
      const phoneInfo = normalizePhone(row[state.phoneColumn]);
      const isSent = isRowSent(row, originalIndex);
      const name = (row['Nama'] || row['Name'] || '').toString().toLowerCase();
      const label = (row['Label'] || '').toString().toLowerCase();
      const phone = (row[state.phoneColumn] || '').toString().toLowerCase();
      const note = getGuestNote(row).toLowerCase();
      const guestSide = getGuestSide(row);

      // 1. Pihak / Notes filter (Dhifa, Riefky, Abi, Umi, Papa, Mama)
      if (sideFilter !== 'all' && guestSide !== sideFilter) return false;

      // 2. Status filter
      if (filter === 'pending' && isSent) return false;
      if (filter === 'sent' && !isSent) return false;

      // 3. Search query
      if (q) return name.includes(q) || label.includes(q) || phone.includes(q) || note.includes(q);
      return true;
    });
  }

  function updateStatsAndProgress() {
    const total = state.rawRows.length;
    let withPhone = 0, sentCount = 0;
    let totalPax = 0, sentPax = 0, withPhonePax = 0;
    let dhifaCount = 0, riefkyCount = 0, abiCount = 0, umiCount = 0, papaCount = 0, mamaCount = 0;

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

      const side = getGuestSide(row);
      if (side === 'dhifa') dhifaCount++;
      else if (side === 'riefky') riefkyCount++;
      else if (side === 'abi') abiCount++;
      else if (side === 'umi') umiCount++;
      else if (side === 'papa') papaCount++;
      else if (side === 'mama') mamaCount++;
    });

    const pendingCount = total - sentCount;
    const pendingPax = totalPax - sentPax;
    const percentage = total > 0 ? Math.round((sentCount / total) * 100) : 0;

    dom.statTotalGuests.textContent = total;
    if (dom.statTotalPax) {
      dom.statTotalPax.classList.remove('has-skeleton');
      dom.statTotalPax.textContent = `👥 ${totalPax} Tamu`;
    }

    dom.statSentCount.textContent = `${sentCount} (${percentage}%)`;
    if (dom.statSentPax) {
      dom.statSentPax.classList.remove('has-skeleton');
      dom.statSentPax.textContent = `👥 ${sentPax} Tamu`;
    }

    dom.statPendingCount.textContent = pendingCount;
    if (dom.statPendingPax) {
      dom.statPendingPax.classList.remove('has-skeleton');
      dom.statPendingPax.textContent = `👥 ${pendingPax} Tamu`;
    }

    if (dom.statWithPhone) dom.statWithPhone.textContent = withPhone;
    if (dom.statWithPhonePax) dom.statWithPhonePax.textContent = `👥 ${withPhonePax} Tamu`;

    dom.progressPercentage.textContent = `${percentage}% (${sentCount}/${total} Undangan · ${sentPax}/${totalPax} Tamu)`;
    dom.progressBarFill.style.width = `${percentage}%`;

    // Status filter counters
    const countAllEl = document.getElementById('countFilterAll');
    const countPendingEl = document.getElementById('countFilterPending');
    const countSentEl = document.getElementById('countFilterSent');
    if (countAllEl) countAllEl.textContent = total;
    if (countPendingEl) countPendingEl.textContent = pendingCount;
    if (countSentEl) countSentEl.textContent = sentCount;

    // Pihak / Notes filter counters
    const countSideAllEl = document.getElementById('countSideAll');
    const countSideDhifaEl = document.getElementById('countSideDhifa');
    const countSideRiefkyEl = document.getElementById('countSideRiefky');
    const countSideAbiEl = document.getElementById('countSideAbi');
    const countSideUmiEl = document.getElementById('countSideUmi');
    const countSidePapaEl = document.getElementById('countSidePapa');
    const countSideMamaEl = document.getElementById('countSideMama');
    if (countSideAllEl) countSideAllEl.textContent = total;
    if (countSideDhifaEl) countSideDhifaEl.textContent = dhifaCount;
    if (countSideRiefkyEl) countSideRiefkyEl.textContent = riefkyCount;
    if (countSideAbiEl) countSideAbiEl.textContent = abiCount;
    if (countSideUmiEl) countSideUmiEl.textContent = umiCount;
    if (countSidePapaEl) countSidePapaEl.textContent = papaCount;
    if (countSideMamaEl) countSideMamaEl.textContent = mamaCount;
  }

  // ===========================================================================
  // Modal Preview
  // ===========================================================================
  function openPreviewModal(row, index, compiledMsg, waUrl, phoneInfo) {
    const name = (row['Nama'] || row['Name'] || '-').trim();
    const sapaan = (row['Sapaan'] || '').trim();
    const isSent = isRowSent(row, index);
    const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;
    const side = getGuestSide(row);
    const note = getGuestNote(row);
    const label = (row['Label'] || '').trim();

    dom.modalGuestTitle.textContent = `Pesan Undangan: ${name}`;

    let modalMetaHtml = `<span class="meta-chip">Undangan #${index + 1}</span>`;
    modalMetaHtml += `<span class="meta-chip meta-chip-blue">👥 ${pax} Tamu</span>`;
    const sideBadge = getSideBadgeHtml(side);
    if (sideBadge) modalMetaHtml += sideBadge;
    if (label && label !== '-' && label !== '--') modalMetaHtml += `<span class="meta-chip">${escapeHtml(label)}</span>`;
    if (note && note !== '-' && note !== '--') modalMetaHtml += `<span class="meta-chip meta-chip-note">📝 ${escapeHtml(note)}</span>`;
    modalMetaHtml += `<span class="meta-chip ${phoneInfo.isValid ? 'meta-chip-blue' : ''}">${phoneInfo.isValid ? 'WA: +' + phoneInfo.formatted : 'Tanpa Nomor WA'}</span>`;
    modalMetaHtml += `<span class="meta-chip" style="background:${isSent ? '#DCFCE7' : '#F1F5F9'};color:${isSent ? '#166534' : '#475569'};font-weight:700;">${isSent ? 'Sudah Dikirim' : 'Belum Dikirim'}</span>`;

    dom.modalGuestInfo.innerHTML = modalMetaHtml;

    const formattedHtml = parseWhatsAppFormatting(compiledMsg);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    dom.modalMessageContent.innerHTML = `<div class="wa-msg-text">${formattedHtml}</div><div class="wa-meta-time"><span>${timeStr}</span><span class="wa-ticks">✓✓</span></div>`;

    dom.modalWaLinkInput.value = waUrl || '(Nomor WA tidak tersedia)';
    dom.btnModalCopyLink.disabled = !phoneInfo.isValid;
    dom.btnModalSendWa.disabled = !phoneInfo.isValid;
    dom.btnModalCopyLink.onclick = () => copyToClipboard(waUrl, 'Link wa.me berhasil disalin!');
    dom.btnModalCopyText.onclick = () => copyToClipboard(compiledMsg, 'Teks pesan berhasil disalin!');
    if (dom.btnModalDeleteGuest) {
      dom.btnModalDeleteGuest.onclick = () => {
        closeModal();
        confirmDeleteGuest(index);
      };
    }
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
    const isDanger = type === 'danger';
    const isInfo = type === 'info';
    toast.className = `toast ${isDanger ? 'toast-danger' : (isInfo ? 'toast-info' : '')}`;
    const icon = isDanger ? 'alert-triangle' : (isInfo ? 'info' : 'check-circle-2');
    toast.innerHTML = `<i data-lucide="${icon}" style="width:16px;height:16px;"></i> <span>${escapeHtml(message)}</span>`;
    dom.toastContainer.appendChild(toast);
    setupLucideIcons();
    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s, transform 0.25s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
    }, 3200);
  }

  // ===========================================================================
  // Activity Log Modal & Viewer
  // ===========================================================================
  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 45) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  function getActivityIconConfig(action) {
    switch (action) {
      case 'STATUS_SENT':
        return { icon: 'check-circle-2', class: 'activity-icon-status-sent' };
      case 'STATUS_PENDING':
        return { icon: 'clock', class: 'activity-icon-status-pending' };
      case 'STATUS_RESET':
        return { icon: 'rotate-ccw', class: 'activity-icon-status-reset' };
      case 'TEMPLATE_UPDATED':
        return { icon: 'file-text', class: 'activity-icon-template' };
      case 'GUESTS_IMPORTED':
        return { icon: 'user-plus', class: 'activity-icon-upload' };
      case 'GUEST_DELETED':
        return { icon: 'trash-2', class: 'activity-icon-delete' };
      default:
        return { icon: 'activity', class: 'activity-icon-status-sent' };
    }
  }

  async function loadActivityLogs() {
    if (!dom.activityLogList) return;
    if (dom.activityLogCount) dom.activityLogCount.textContent = 'Memuat riwayat...';
    try {
      const res = await apiGet('/api/logs?limit=50');
      const logs = res.logs || [];
      renderActivityLogs(logs);
    } catch (err) {
      console.warn('Failed to load activity logs:', err);
      if (dom.activityLogCount) dom.activityLogCount.textContent = 'Gagal memuat riwayat';
    }
  }

  function renderActivityLogs(logs) {
    if (!dom.activityLogList) return;
    dom.activityLogList.innerHTML = '';
    if (!logs || logs.length === 0) {
      if (dom.activityLogEmpty) dom.activityLogEmpty.style.display = 'block';
      if (dom.activityLogCount) dom.activityLogCount.textContent = '0 aktivitas tercatat';
      return;
    }
    if (dom.activityLogEmpty) dom.activityLogEmpty.style.display = 'none';
    if (dom.activityLogCount) dom.activityLogCount.textContent = `Menampilkan ${logs.length} aktivitas terbaru`;

    logs.forEach(log => {
      const { icon, class: badgeClass } = getActivityIconConfig(log.action);
      const timeStr = formatRelativeTime(log.created_at);
      const device = log.device_info || 'Perangkat Tidak Dikenal';
      const location = log.location || '';
      const ip = log.ip_address || '';

      const item = document.createElement('div');
      item.className = 'activity-log-item';
      item.innerHTML = `
        <div class="activity-icon-badge ${badgeClass}">
          <i data-lucide="${icon}" style="width:16px;height:16px;"></i>
        </div>
        <div class="activity-body">
          <div class="activity-header-line">
            <span class="activity-summary">${escapeHtml(log.summary)}</span>
            <span class="activity-time">${escapeHtml(timeStr)}</span>
          </div>
          <div class="activity-meta-line">
            <span class="activity-meta-pill" title="Perangkat & Browser">
              <i data-lucide="smartphone"></i> ${escapeHtml(device)}
            </span>
            ${location && location !== 'Lokal / Tidak Terdeteksi' ? `
              <span class="activity-meta-pill" title="Lokasi">
                <i data-lucide="map-pin"></i> ${escapeHtml(location)}
              </span>
            ` : ''}
            ${ip && ip !== '127.0.0.1' && ip !== '::1' ? `
              <span class="activity-meta-pill" title="Alamat IP">
                <i data-lucide="globe"></i> ${escapeHtml(ip)}
              </span>
            ` : ''}
          </div>
        </div>
      `;
      dom.activityLogList.appendChild(item);
    });
    setupLucideIcons();
  }

  function openActivityLogModal() {
    if (!dom.activityLogModal) return;
    dom.activityLogModal.style.display = 'flex';
    loadActivityLogs();
  }

  function closeActivityLogModal() {
    if (!dom.activityLogModal) return;
    dom.activityLogModal.style.display = 'none';
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
      processExcelFile(file);
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

    // Activity Log Modal Listeners
    if (dom.btnOpenActivityLog) {
      dom.btnOpenActivityLog.addEventListener('click', openActivityLogModal);
    }
    if (dom.btnCloseActivityLogModal) {
      dom.btnCloseActivityLogModal.addEventListener('click', closeActivityLogModal);
    }
    if (dom.btnCloseActivityLogBottom) {
      dom.btnCloseActivityLogBottom.addEventListener('click', closeActivityLogModal);
    }
    if (dom.btnRefreshActivityLog) {
      dom.btnRefreshActivityLog.addEventListener('click', loadActivityLogs);
    }
    if (dom.activityLogModal) {
      dom.activityLogModal.addEventListener('click', (e) => {
        if (e.target === dom.activityLogModal) closeActivityLogModal();
      });
    }

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
      logActivity({
        action: 'TEMPLATE_UPDATED',
        summary: 'Menyimpan perubahan template pesan WhatsApp',
        details: {}
      });
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
          logActivity({
            action: 'TEMPLATE_UPDATED',
            summary: 'Mereset template pesan ke format Formal bawaan',
            details: {}
          });
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
            const key = getRowKey(row, originalIndex);
            state.sentStatuses[key] = true;
          }
          renderTable();
          updateStatsAndProgress();
          broadcastRealtimeEvent('bulk_status_updated', { sentStatuses: state.sentStatuses });
          for (const { row, originalIndex } of filtered) {
            await persistSentStatus(getRowKey(row, originalIndex), true);
          }
          logActivity({
            action: 'STATUS_SENT',
            summary: `Menandai ${filtered.length} tamu sebagai Sudah Dikirim`,
            details: { count: filtered.length }
          });
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
          state.sentStatuses = {};
          renderTable();
          updateStatsAndProgress();
          broadcastRealtimeEvent('bulk_status_updated', { sentStatuses: {} });
          try {
            await apiDelete('/api/sent-status');
          } catch (e) {
            console.warn('Failed to reset on Supabase', e);
          }
          logActivity({
            action: 'STATUS_RESET',
            summary: 'Mereset semua status pengiriman ke Belum Kirim',
            details: {}
          });
          showToast('Semua status pengiriman berhasil di-reset.', 'success');
        }
      });
    });

    // Notes / Pihak Filter Dropdown
    const SIDE_FILTER_LABELS = {
      all: 'Filter: Semua',
      dhifa: 'Filter: 🌸 Dhifa',
      riefky: 'Filter: 💼 Riefky',
      abi: 'Filter: 🧔 Abi',
      umi: 'Filter: 🧕 Umi',
      papa: 'Filter: 👨 Papa',
      mama: 'Filter: 👩 Mama'
    };

    if (dom.btnSideFilterDropdown && dom.sideFilterDropdownMenu) {
      dom.btnSideFilterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dom.sideFilterDropdownMenu.style.display === 'none';
        dom.sideFilterDropdownMenu.style.display = isHidden ? 'flex' : 'none';
        dom.btnSideFilterDropdown.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });

      dom.sideFilterDropdownMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.filter-dropdown-option');
        if (!option) return;
        const selectedSide = option.dataset.side || 'all';
        state.currentSideFilter = selectedSide;

        dom.sideFilterDropdownMenu.querySelectorAll('.filter-dropdown-option').forEach(opt => {
          opt.classList.toggle('active', opt === option);
        });

        if (dom.sideFilterSelectedText) {
          dom.sideFilterSelectedText.textContent = SIDE_FILTER_LABELS[selectedSide] || 'Filter: Semua';
        }

        if (dom.btnSideFilterDropdown) {
          dom.btnSideFilterDropdown.classList.toggle('has-filter', selectedSide !== 'all');
        }

        dom.sideFilterDropdownMenu.style.display = 'none';
        dom.btnSideFilterDropdown.setAttribute('aria-expanded', 'false');
        renderTable();
      });

      document.addEventListener('click', (e) => {
        if (dom.sideDropdownContainer && !dom.sideDropdownContainer.contains(e.target)) {
          dom.sideFilterDropdownMenu.style.display = 'none';
          if (dom.btnSideFilterDropdown) dom.btnSideFilterDropdown.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dom.sideFilterDropdownMenu.style.display !== 'none') {
          dom.sideFilterDropdownMenu.style.display = 'none';
          if (dom.btnSideFilterDropdown) dom.btnSideFilterDropdown.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Import Preview Modal listeners
    if (dom.btnCloseImportModal) dom.btnCloseImportModal.addEventListener('click', closeImportPreviewModal);
    if (dom.btnCancelImport) dom.btnCancelImport.addEventListener('click', closeImportPreviewModal);
    if (dom.btnConfirmImport) {
      dom.btnConfirmImport.addEventListener('click', async () => {
        await confirmAndAppendNewGuests();
      });
    }
    if (dom.importPreviewModal) {
      dom.importPreviewModal.addEventListener('click', (e) => {
        if (e.target === dom.importPreviewModal) closeImportPreviewModal();
      });
    }
    if (dom.selectAllNewImport) {
      dom.selectAllNewImport.addEventListener('change', (e) => {
        const checked = e.target.checked;
        pendingImportItems.forEach(item => {
          if (!item.isDuplicate) {
            item.selected = checked;
          }
        });
        const checkboxes = dom.importPreviewTableBody.querySelectorAll('.import-checkbox:not(:disabled)');
        checkboxes.forEach(chk => { chk.checked = checked; });
        updateConfirmImportButton();
      });
    }

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

    if (dom.btnToggleTopConfig && dom.topConfigGrid) {
      dom.btnToggleTopConfig.addEventListener('click', () => {
        const isExpanded = dom.topConfigGrid.classList.toggle('show-mobile');
        dom.btnToggleTopConfig.classList.toggle('expanded', isExpanded);
        setupLucideIcons();
      });
    }

    dom.btnCloseModal.addEventListener('click', closeModal);
    dom.previewModal.addEventListener('click', (e) => { if (e.target === dom.previewModal) closeModal(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dom.customConfirmModal && dom.customConfirmModal.style.display === 'flex') {
          closeConfirmModal();
        } else if (dom.importPreviewModal && dom.importPreviewModal.style.display === 'flex') {
          closeImportPreviewModal();
        } else {
          closeModal();
        }
      }
    });

    // Auto-sync & reconnect when device wakes up or tab regains focus
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const sb = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
        if (!realtimeChannel || sb?.realtime?.connectionState() !== 'open') {
          setupRealtime();
        }
        reloadGuestsAndStatusesFromCloud();
      }
    });

    window.addEventListener('online', () => {
      setupRealtime();
      reloadGuestsAndStatusesFromCloud();
    });

    window.addEventListener('focus', () => {
      reloadGuestsAndStatusesFromCloud();
    });
  }

  // ===========================================================================
  // App Init (after PIN unlocked)
  // ===========================================================================
  async function initApp() {
    setupEventListeners();
    setupLucideIcons();
    setupRealtime();

    // Show loading state when data is still loading
    setInitialLoading(true);

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

    // Load guests: prefer Supabase, fall back to default Excel directly
    try {
      const loadedFromDB = await loadGuestsFromSupabase();
      if (!loadedFromDB) {
        await loadDefaultExcelDirectly();
      } else {
        updateLivePreview();
      }
    } catch (err) {
      console.warn('Error loading initial guests:', err);
    } finally {
      setInitialLoading(false);
      if (state.rawRows.length === 0) {
        renderTable();
      }
    }
    window.__setInitialLoading = setInitialLoading;
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
