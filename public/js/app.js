/**
 * Viding WA Template Generator
 * Handles Excel parsing, dynamic tag insertion, Indonesian phone normalization,
 * wa.me link generation, message compilation, and interactive sent status tracking.
 */

(function () {
  'use strict';

  // Preset Templates
  const PRESET_TEMPLATES = {
    formal: `Kepada Yth.
[Sapaan] [Nama]

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara resepsi pernikahan kami:

*Dhifa & Riefky*

Berikut tautan undangan kami untuk informasi lengkap mengenai waktu & lokasi acara:
👉 [Link]

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu bagi kami berdua.

Mohon maaf atas keterbatasan pengiriman undangan yang disampaikan melalui pesan ini.

Terima kasih banyak atas perhatian dan doa restunya.

Salam hangat,
*Dhifa & Riefky*`,

    casual: `Halo [Nama]! ✨

Semoga kamu dan keluarga selalu sehat dan berbahagia yaa.

Dengan penuh rasa syukur dan bahagia, kami ingin mengundang kamu untuk hadir dan merayakan momen istimewa pernikahan kami:

*Dhifa & Riefky*

Info detail mengenai waktu dan lokasi acara bisa kamu akses langsung di link undangan berikut yaa:
👉 [Link]

Kehadiran dan doa restu dari kamu tentu akan sangat melengkapi kebahagiaan kami berdua di hari spesial nanti. See you there! 🎉

Salam hangat,
*Dhifa & Riefky*`,

    singkat: `Kepada Yth. [Sapaan] [Nama],

Berikut kami sampaikan tautan undangan resmi pernikahan *Dhifa & Riefky*:
👉 [Link]

Besar harapan kami agar Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu. Terima kasih banyak atas perhatiannya. 🙏`
  };

  // State Management
  const state = {
    rawRows: [],
    columns: [],
    phoneColumn: '',
    currentFilter: 'all',
    searchQuery: '',
    selectedPreviewIndex: 0,
    sentStatuses: {}, // { [uniqueKey]: boolean }
    currentTemplate: ''
  };

  // DOM Elements Cache
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
    btnModalSendWa: document.getElementById('btnModalSendWa')
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    loadSentStatuses();
    setupEventListeners();
    setupLucideIcons();

    // Load initial template
    const savedCustom = localStorage.getItem('viding_custom_template');
    if (savedCustom) {
      state.currentTemplate = savedCustom;
      dom.templatePresetSelect.value = 'custom';
    } else {
      state.currentTemplate = PRESET_TEMPLATES.formal;
      dom.templatePresetSelect.value = 'formal';
    }
    dom.templateInput.value = state.currentTemplate;
    updateCharCounter();

    // Auto-load default excel on startup
    loadDefaultExcel();
  }

  // ==========================================================================
  // Lucide Icons Helper
  // ==========================================================================
  function setupLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // Sent Status Persistence (localStorage)
  // ==========================================================================
  function loadSentStatuses() {
    try {
      const stored = localStorage.getItem('viding_sent_statuses');
      state.sentStatuses = stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to parse sent statuses from localStorage', e);
      state.sentStatuses = {};
    }
  }

  function saveSentStatuses() {
    try {
      localStorage.setItem('viding_sent_statuses', JSON.stringify(state.sentStatuses));
    } catch (e) {
      console.warn('Failed to save sent statuses', e);
    }
  }

  function getRowKey(row, index) {
    const name = (row['Nama'] || row['Name'] || '').trim();
    const phone = (row[state.phoneColumn] || '').toString().trim();
    return `${name}_${phone}_${index}`;
  }

  function isRowSent(row, index) {
    const key = getRowKey(row, index);
    return !!state.sentStatuses[key];
  }

  function setRowSent(row, index, isSent) {
    const key = getRowKey(row, index);
    if (isSent) {
      state.sentStatuses[key] = true;
    } else {
      delete state.sentStatuses[key];
    }
    saveSentStatuses();
    updateStatsAndProgress();
  }

  // ==========================================================================
  // Excel File Parsing & Loading
  // ==========================================================================
  function loadDefaultExcel() {
    fetch('/api/default-excel')
      .then(res => {
        if (!res.ok) throw new Error('Default Excel file not found');
        return res.arrayBuffer();
      })
      .then(buffer => {
        processExcelBuffer(buffer, 'invitation_list_36032.xlsx (Bawaan)');
        showToast('Template bawaan berhasil dimuat!', 'success');
      })
      .catch(err => {
        console.warn('Could not auto-load default Excel:', err);
      });
  }

  function processExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      processExcelBuffer(data, file.name);
      showToast(`File ${file.name} berhasil dimuat!`, 'success');
    };
    reader.readAsArrayBuffer(file);
  }

  function processExcelBuffer(buffer, filename) {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON array of objects
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!jsonData || jsonData.length === 0) {
        showToast('File Excel kosong atau tidak memiliki data.', 'danger');
        return;
      }

      state.rawRows = jsonData;
      // Extract columns from first row keys
      state.columns = Object.keys(jsonData[0]);

      // Detect phone column
      state.phoneColumn = detectPhoneColumn(state.columns);

      // Render UI components
      updateFileStatusBar(filename, jsonData.length);
      populatePhoneColSelector();
      renderTagChips();
      populatePreviewGuestDropdown();
      renderTable();
      updateStatsAndProgress();
      updateLivePreview();
    } catch (err) {
      console.error('Error parsing Excel:', err);
      showToast('Gagal membaca file Excel. Pastikan format valid.', 'danger');
    }
  }

  function detectPhoneColumn(columns) {
    const priorityKeywords = [
      'nomor whatsapp',
      'no whatsapp',
      'whatsapp',
      'no wa',
      'wa',
      'phone',
      'nomor telepon',
      'telepon',
      'telp',
      'hp'
    ];

    for (const kw of priorityKeywords) {
      const found = columns.find(c => c.toLowerCase().trim() === kw);
      if (found) return found;
    }

    for (const kw of priorityKeywords) {
      const found = columns.find(c => c.toLowerCase().includes(kw));
      if (found) return found;
    }

    return columns[0] || '';
  }

  function updateFileStatusBar(filename, rowCount) {
    dom.fileStatusBar.style.display = 'flex';
    dom.loadedFileName.textContent = filename;
    dom.loadedFileDetails.textContent = `${rowCount} Tamu Undangan terdeteksi`;
  }

  function populatePhoneColSelector() {
    dom.phoneColSelect.innerHTML = '';
    state.columns.forEach(col => {
      const option = document.createElement('option');
      option.value = col;
      option.textContent = col;
      if (col === state.phoneColumn) {
        option.selected = true;
      }
      dom.phoneColSelect.appendChild(option);
    });
  }

  // ==========================================================================
  // Dynamic Tag Chips
  // ==========================================================================
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
    const textarea = dom.templateInput;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    textarea.value = before + tagText + after;
    textarea.selectionStart = textarea.selectionEnd = start + tagText.length;
    textarea.focus();

    state.currentTemplate = textarea.value;
    updateCharCounter();
    updateLivePreview();
    renderTable();
    showToast(`Tag ${tagText} disisipkan!`, 'success');
  }

  // ==========================================================================
  // Phone Normalization & Message Compiler
  // ==========================================================================
  /**
   * Normalizes Indonesian phone numbers into international wa.me format
   * e.g., '0858-9138-9222' -> '6285891389222'
   * e.g., '+62 858 9138 9222' -> '6285891389222'
   * e.g., '85891389222' -> '6285891389222'
   */
  function normalizePhone(rawPhone) {
    if (!rawPhone) return { isValid: false, formatted: '', raw: '' };
    
    let str = rawPhone.toString().trim();
    const rawDisplay = str;
    
    // Strip everything except digits
    let digits = str.replace(/[^0-9]/g, '');

    if (!digits || digits === '0' || digits.length < 8) {
      return { isValid: false, formatted: '', raw: rawDisplay };
    }

    if (digits.startsWith('0')) {
      digits = '62' + digits.substring(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    } else if (!digits.startsWith('62')) {
      if (!(digits.length >= 9 && digits.length <= 15)) {
        return { isValid: false, formatted: '', raw: rawDisplay };
      }
    }

    if (digits.length >= 10 && digits.length <= 16) {
      return { isValid: true, formatted: digits, raw: rawDisplay };
    }

    return { isValid: false, formatted: digits, raw: rawDisplay };
  }

  /**
   * Replaces any [ColumnName] placeholder case-insensitively with recipient data
   */
  function compileMessage(template, row) {
    if (!template) return '';

    return template.replace(/\[([^\]]+)\]/g, (match, tag) => {
      const cleanTag = tag.trim().toLowerCase();
      // Look up in row keys case-insensitively
      for (const col of Object.keys(row)) {
        if (col.trim().toLowerCase() === cleanTag) {
          const val = row[col];
          return (val !== null && val !== undefined && val !== '-') ? String(val) : '';
        }
      }
      return match;
    });
  }

  function generateWaUrl(phoneFormatted, messageText) {
    if (!phoneFormatted) return '';
    const encoded = encodeURIComponent(messageText);
    return `https://wa.me/${phoneFormatted}?text=${encoded}`;
  }

  // ==========================================================================
  // Live Preview
  // ==========================================================================
  function populatePreviewGuestDropdown() {
    dom.previewGuestSelect.innerHTML = '';
    if (state.rawRows.length === 0) return;

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
      dom.livePreviewBubble.innerHTML = `<em>Silakan unggah file Excel untuk melihat preview pesan undangan secara langsung.</em>`;
      return;
    }

    const row = state.rawRows[state.selectedPreviewIndex] || state.rawRows[0];
    const compiled = compileMessage(state.currentTemplate, row);
    
    // Highlight links in preview
    const formattedHtml = escapeHtml(compiled).replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" style="color: #0284C7; text-decoration: underline; font-weight: 600;">$1</a>'
    );

    dom.livePreviewBubble.innerHTML = formattedHtml || '<em>(Pesan kosong)</em>';
  }

  function updateCharCounter() {
    const text = dom.templateInput.value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    dom.charCounter.textContent = `${charCount} karakter | ${wordCount} kata`;
  }

  // ==========================================================================
  // Table Rendering & Interactive Status Badges
  // ==========================================================================
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

      // 1. Number Cell
      const tdNo = document.createElement('td');
      tdNo.className = 'col-num';
      tdNo.textContent = originalIndex + 1;

      // 2. Status Badge Button Cell (Click to toggle!)
      const tdStatus = document.createElement('td');
      tdStatus.className = 'col-status';
      const btnStatus = document.createElement('button');
      btnStatus.type = 'button';
      btnStatus.className = `status-pill-btn ${isSent ? 'status-sent' : 'status-pending'}`;
      btnStatus.innerHTML = isSent
        ? `<i data-lucide="check-circle-2" style="width: 14px; height: 14px;"></i> Sudah Dikirim`
        : `<i data-lucide="clock" style="width: 14px; height: 14px;"></i> Belum Dikirim`;
      btnStatus.title = isSent ? 'Klik untuk tandai Belum Dikirim' : 'Klik untuk tandai Sudah Dikirim';
      
      btnStatus.addEventListener('click', () => {
        const nextState = !isRowSent(row, originalIndex);
        setRowSent(row, originalIndex, nextState);
        renderTable();
        showToast(nextState ? `Tamu ${guestName} ditandai Sudah Dikirim!` : `Tamu ${guestName} ditandai Belum Dikirim.`, 'success');
      });
      tdStatus.appendChild(btnStatus);

      // 3. Guest Name & Badges Cell
      const tdName = document.createElement('td');
      tdName.className = 'col-name';
      let metaChipsHtml = '';
      if (sapaan) metaChipsHtml += `<span class="meta-chip">${escapeHtml(sapaan)}</span>`;
      if (label) metaChipsHtml += `<span class="meta-chip meta-chip-blue">${escapeHtml(label)}</span>`;
      
      tdName.innerHTML = `
        <div class="guest-name-cell">
          <div class="guest-name-text">${escapeHtml(guestName)}</div>
          ${metaChipsHtml ? `<div class="guest-meta-tags">${metaChipsHtml}</div>` : ''}
        </div>
      `;

      // 4. Phone Cell
      const tdPhone = document.createElement('td');
      tdPhone.className = 'col-phone phone-cell-text';
      if (phoneInfo.isValid) {
        tdPhone.innerHTML = `
          <span class="phone-valid">
            <i data-lucide="check" style="width: 14px; height: 14px;"></i>
            +${escapeHtml(phoneInfo.formatted)}
          </span>
        `;
      } else {
        tdPhone.innerHTML = `
          <span class="phone-empty">
            <i data-lucide="phone-off" style="width: 12px; height: 12px;"></i>
            Tanpa Nomor
          </span>
        `;
      }

      // 5. Link Cell
      const tdLink = document.createElement('td');
      tdLink.className = 'col-link';
      if (link && link.startsWith('http')) {
        tdLink.innerHTML = `<a href="${escapeHtml(link)}" target="_blank" class="link-url-text" title="${escapeHtml(link)}">${escapeHtml(link)}</a>`;
      } else {
        tdLink.innerHTML = `<span style="color: var(--slate-400);">-</span>`;
      }

      // 6. Action Buttons Group (Right-aligned, Spaced, High-contrast)
      const tdActions = document.createElement('td');
      tdActions.className = 'col-actions';
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'action-buttons-group';

      // Button: Kirim WA
      const btnSend = document.createElement('button');
      btnSend.type = 'button';
      btnSend.className = 'btn-send-wa';
      btnSend.innerHTML = `<i data-lucide="send" style="width: 13px; height: 13px;"></i> Kirim WA`;
      btnSend.title = phoneInfo.isValid ? 'Buka WhatsApp & tandai Sudah Dikirim' : 'Nomor WhatsApp tidak tersedia';
      if (!phoneInfo.isValid) {
        btnSend.classList.add('btn-action-disabled');
      } else {
        btnSend.addEventListener('click', () => {
          window.open(waUrl, '_blank');
          setRowSent(row, originalIndex, true);
          renderTable();
          showToast(`Membuka WhatsApp untuk ${guestName}...`, 'success');
        });
      }

      // Button: Salin Link wa.me
      const btnCopyLink = document.createElement('button');
      btnCopyLink.type = 'button';
      btnCopyLink.className = 'btn-copy-link';
      btnCopyLink.innerHTML = `<i data-lucide="link" style="width: 13px; height: 13px;"></i> Salin Link`;
      btnCopyLink.title = phoneInfo.isValid ? 'Salin tautan wa.me ke clipboard' : 'Nomor WhatsApp tidak tersedia';
      if (!phoneInfo.isValid) {
        btnCopyLink.classList.add('btn-action-disabled');
      } else {
        btnCopyLink.addEventListener('click', () => {
          copyToClipboard(waUrl, `Link wa.me untuk ${guestName} berhasil disalin!`);
        });
      }

      // Button: Salin Pesan (Available for all!)
      const btnCopyMsg = document.createElement('button');
      btnCopyMsg.type = 'button';
      btnCopyMsg.className = 'btn-copy-msg';
      btnCopyMsg.innerHTML = `<i data-lucide="copy" style="width: 13px; height: 13px;"></i> Salin Pesan`;
      btnCopyMsg.title = 'Salin teks pesan undangan yang telah digenerate';
      btnCopyMsg.addEventListener('click', () => {
        copyToClipboard(compiledMsg, `Teks undangan untuk ${guestName} disalin!`);
      });

      // Button: View Preview Modal
      const btnView = document.createElement('button');
      btnView.type = 'button';
      btnView.className = 'btn-view-preview';
      btnView.innerHTML = `<i data-lucide="eye" style="width: 14px; height: 14px;"></i>`;
      btnView.title = 'Lihat detail pesan';
      btnView.addEventListener('click', () => {
        openPreviewModal(row, originalIndex, compiledMsg, waUrl, phoneInfo);
      });

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

    return state.rawRows
      .map((row, originalIndex) => ({ row, originalIndex }))
      .filter(({ row, originalIndex }) => {
        const phoneInfo = normalizePhone(row[state.phoneColumn]);
        const isSent = isRowSent(row, originalIndex);
        const name = (row['Nama'] || row['Name'] || '').toString().toLowerCase();
        const label = (row['Label'] || '').toString().toLowerCase();
        const phone = (row[state.phoneColumn] || '').toString().toLowerCase();

        // Status Filter
        if (filter === 'pending' && isSent) return false;
        if (filter === 'sent' && !isSent) return false;
        if (filter === 'has-phone' && !phoneInfo.isValid) return false;
        if (filter === 'no-phone' && phoneInfo.isValid) return false;

        // Search Filter
        if (q) {
          const matchName = name.includes(q);
          const matchLabel = label.includes(q);
          const matchPhone = phone.includes(q);
          return matchName || matchLabel || matchPhone;
        }

        return true;
      });
  }

  // ==========================================================================
  // Stats & Progress Calculation
  // ==========================================================================
  function updateStatsAndProgress() {
    const total = state.rawRows.length;
    let withPhone = 0;
    let sentCount = 0;

    state.rawRows.forEach((row, idx) => {
      const phoneInfo = normalizePhone(row[state.phoneColumn]);
      if (phoneInfo.isValid) withPhone++;
      if (isRowSent(row, idx)) sentCount++;
    });

    const pendingCount = total - sentCount;
    const withoutPhone = total - withPhone;
    const percentage = total > 0 ? Math.round((sentCount / total) * 100) : 0;

    // Header metrics
    dom.statTotalGuests.textContent = total;
    dom.statSentCount.textContent = `${sentCount} (${percentage}%)`;
    dom.statPendingCount.textContent = pendingCount;
    dom.statWithPhone.textContent = withPhone;

    // Progress bar
    dom.progressPercentage.textContent = `${percentage}% (${sentCount}/${total} Terkirim)`;
    dom.progressBarFill.style.width = `${percentage}%`;

    // Filter tab counts
    document.getElementById('countFilterAll').textContent = total;
    document.getElementById('countFilterPending').textContent = pendingCount;
    document.getElementById('countFilterSent').textContent = sentCount;
    document.getElementById('countFilterHasPhone').textContent = withPhone;
    document.getElementById('countFilterNoPhone').textContent = withoutPhone;
  }

  // ==========================================================================
  // Modal Preview
  // ==========================================================================
  function openPreviewModal(row, index, compiledMsg, waUrl, phoneInfo) {
    const name = (row['Nama'] || row['Name'] || '-').trim();
    const sapaan = (row['Sapaan'] || '').trim();
    const isSent = isRowSent(row, index);

    dom.modalGuestTitle.textContent = `Pesan Undangan: ${sapaan} ${name}`;
    dom.modalGuestInfo.innerHTML = `
      <span class="meta-chip">Tamu #${index + 1}</span>
      <span class="meta-chip ${phoneInfo.isValid ? 'meta-chip-blue' : ''}">
        ${phoneInfo.isValid ? 'WA: +' + phoneInfo.formatted : 'Tanpa Nomor WA'}
      </span>
      <span class="meta-chip" style="background: ${isSent ? '#DCFCE7' : '#F1F5F9'}; color: ${isSent ? '#166534' : '#475569'}; font-weight: 700;">
        ${isSent ? 'Sudah Dikirim' : 'Belum Dikirim'}
      </span>
    `;

    dom.modalMessageContent.textContent = compiledMsg;
    dom.modalWaLinkInput.value = waUrl || '(Nomor WA tidak tersedia untuk generate link)';
    dom.btnModalCopyLink.disabled = !phoneInfo.isValid;
    dom.btnModalSendWa.disabled = !phoneInfo.isValid;

    dom.btnModalCopyLink.onclick = () => {
      copyToClipboard(waUrl, 'Link wa.me berhasil disalin!');
    };

    dom.btnModalCopyText.onclick = () => {
      copyToClipboard(compiledMsg, 'Teks pesan undangan berhasil disalin!');
    };

    dom.btnModalSendWa.onclick = () => {
      if (phoneInfo.isValid) {
        window.open(waUrl, '_blank');
        setRowSent(row, index, true);
        renderTable();
        closeModal();
        showToast(`Membuka WhatsApp untuk ${name}...`, 'success');
      }
    };

    dom.previewModal.style.display = 'flex';
    setupLucideIcons();
  }

  function closeModal() {
    dom.previewModal.style.display = 'none';
  }

  // ==========================================================================
  // Clipboard & Toast Utilities
  // ==========================================================================
  function copyToClipboard(text, successMessage) {
    if (!text) {
      showToast('Tidak ada teks untuk disalin.', 'danger');
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(successMessage, 'success'))
        .catch(() => fallbackCopy(text, successMessage));
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(successMessage, 'success');
    } catch (e) {
      showToast('Gagal menyalin teks.', 'danger');
    }
    document.body.removeChild(tempInput);
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'danger' ? 'toast-danger' : ''}`;
    
    const iconName = type === 'danger' ? 'alert-triangle' : 'check-circle-2';
    toast.innerHTML = `<i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i> <span>${escapeHtml(message)}</span>`;
    
    dom.toastContainer.appendChild(toast);
    setupLucideIcons();

    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s, transform 0.25s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================
  function setupEventListeners() {
    // File Input Dropzone
    dom.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processExcelFile(file);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dom.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dom.dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dom.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dom.dropzone.classList.remove('dragover');
      });
    });

    dom.dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) processExcelFile(file);
    });

    // Reload Default Button
    dom.btnReloadDefault.addEventListener('click', () => {
      loadDefaultExcel();
    });

    // Phone Column Selector Change
    dom.phoneColSelect.addEventListener('change', (e) => {
      state.phoneColumn = e.target.value;
      renderTable();
      updateStatsAndProgress();
      showToast(`Kolom nomor WhatsApp diatur ke: ${state.phoneColumn}`, 'success');
    });

    // Preset Template Dropdown
    dom.templatePresetSelect.addEventListener('change', (e) => {
      const key = e.target.value;
      if (key === 'custom') {
        const saved = localStorage.getItem('viding_custom_template');
        if (saved) {
          state.currentTemplate = saved;
        }
      } else if (PRESET_TEMPLATES[key]) {
        state.currentTemplate = PRESET_TEMPLATES[key];
      }
      dom.templateInput.value = state.currentTemplate;
      updateCharCounter();
      updateLivePreview();
      renderTable();
      showToast('Template diganti!', 'success');
    });

    // Template Textarea Input
    dom.templateInput.addEventListener('input', (e) => {
      state.currentTemplate = e.target.value;
      updateCharCounter();
      updateLivePreview();
      renderTable();
    });

    // Save Custom Template Button
    dom.btnSaveCustomTemplate.addEventListener('click', () => {
      localStorage.setItem('viding_custom_template', dom.templateInput.value);
      dom.templatePresetSelect.value = 'custom';
      showToast('Template kustom berhasil disimpan di browser!', 'success');
    });

    // Reset Template Button
    dom.btnResetTemplate.addEventListener('click', () => {
      state.currentTemplate = PRESET_TEMPLATES.formal;
      dom.templatePresetSelect.value = 'formal';
      dom.templateInput.value = state.currentTemplate;
      updateCharCounter();
      updateLivePreview();
      renderTable();
      showToast('Template dikembalikan ke format Formal.', 'success');
    });

    // Live Preview Guest Picker
    dom.previewGuestSelect.addEventListener('change', (e) => {
      state.selectedPreviewIndex = parseInt(e.target.value, 10);
      updateLivePreview();
    });

    // Search Input
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

    // Filter Buttons
    dom.filterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;

      dom.filterPills.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.currentFilter = btn.dataset.filter;
      renderTable();
    });

    // Bulk Mark All Sent
    dom.btnMarkAllSent.addEventListener('click', () => {
      const filtered = filterRows();
      if (filtered.length === 0) return;
      filtered.forEach(({ row, originalIndex }) => {
        setRowSent(row, originalIndex, true);
      });
      renderTable();
      showToast(`${filtered.length} tamu ditandai Sudah Dikirim!`, 'success');
    });

    // Bulk Reset All Sent
    dom.btnResetAllSent.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mereset seluruh status pengiriman menjadi Belum Dikirim?')) {
        state.sentStatuses = {};
        saveSentStatuses();
        renderTable();
        updateStatsAndProgress();
        showToast('Semua status pengiriman berhasil di-reset.', 'success');
      }
    });

    // Modal Close
    dom.btnCloseModal.addEventListener('click', closeModal);
    dom.previewModal.addEventListener('click', (e) => {
      if (e.target === dom.previewModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
