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
  // Internationalization (i18n) System
  // Default language is 'en' (English), persisted in localStorage
  // ===========================================================================
  const TRANSLATIONS = {
    en: {
      'pin.title': 'Enter Security PIN',
      'pin.subtitle': 'Enter PIN to access the application',
      'pin.placeholder': 'Enter PIN',
      'pin.error': 'Incorrect PIN. Try again.',
      'pin.unlock': 'Unlock Access',
      'pin.verifying': 'Verifying...',
      'pin.hint': '💍 Exclusively for Dhifa & Riefky',

      'app.title': 'Viding WA Generator',
      'app.subtitle': 'WhatsApp Link & Invitation Template Generator',
      'app.history': 'Activity',
      'app.historyTitle': 'View Activity History & Device Info',

      'stat.totalGuests': 'Total Guests',
      'stat.sent': 'Sent',
      'stat.pending': 'Not Sent',
      'stat.syncConnecting': 'Connecting...',
      'stat.syncActive': 'Sync active 🟢',
      'stat.syncOffline': 'Cloud Saved (Polling) 🟢',
      'stat.syncTitle': 'Realtime synchronization status',
      'stat.guestSingular': 'Guest',
      'stat.guestsSuffix': 'Guests',
      'stat.progressGuests': 'Guests',

      'config.toggleTitle': 'Data & Template Settings',
      'config.toggleHint': 'Open/Close',

      'source.title': 'Excel Data Source',
      'source.subtitle': 'Select Excel invitation file (.xlsx / .xls)',
      'source.dropzoneMain': 'Click or drag <strong>Excel (.xlsx / .xls)</strong> file here',
      'source.dropzoneSub': 'Add new guests without overwriting existing data (auto duplicate check)',
      'source.tagsTitle': 'Available Column Tags:',
      'source.tagsDesc': 'Click tag below to insert into message',

      'template.title': 'WhatsApp Message Template',
      'template.subtitle': 'Customize message with automatic placeholders',
      'template.presetFormal': '💍 Formal Format',
      'template.presetCasual': '🌿 Casual Format (Friends)',
      'template.presetSingkat': '⚡ Short Format (Reminder)',
      'template.presetCustom': '✏️ My Custom Template',
      'template.placeholder': 'Write invitation message format here... Use tags like [Sapaan], [Nama], [Link]',
      'template.charsWords': '{chars} characters | {words} words',
      'template.save': 'Save',
      'template.saveTitle': 'Save as custom template',
      'template.reset': 'Reset',
      'template.resetTitle': 'Reset to initial format',
      'template.previewTitle': 'WhatsApp Recipient Preview:',
      'template.previewFor': 'Preview for:',

      'table.title': 'Guest List & WhatsApp Generator',
      'table.subtitle': 'Manage deliveries, copy WhatsApp links, or send directly to WhatsApp',
      'table.progressLabel': 'Delivery Progress:',
      'table.searchPlaceholder': 'Search name, WA, label...',
      'table.clearSearch': 'Clear search',
      'table.filterSideTitle': 'Filter Notes / Side',
      'table.filterSidePrefix': 'Filter: ',
      'table.sideAll': 'All',
      'table.sideGroomBride': 'Wedding Couple',
      'table.sideFamily': 'Family',
      'table.filterRsvpTitle': 'Filter RSVP Attendance',
      'table.filterRsvpPrefix': 'RSVP: ',
      'table.rsvpAll': 'All RSVP',
      'table.rsvpSummaryTitle': 'RSVP:',
      'table.tabAll': 'All',
      'table.tabPending': '⏳ Not Sent',
      'table.tabSent': '🟢 Sent',
      'table.markAllSent': 'Mark as Sent',
      'table.markAllSentTitle': 'Mark all displayed rows as Sent',
      'table.resetAllSent': 'Reset Status',
      'table.resetAllSentTitle': 'Reset all delivery statuses to Not Sent',
      'table.thNo': 'No',
      'table.thStatus': 'Delivery Status',
      'table.thRsvp': 'RSVP Status',
      'table.thName': 'Guest Name & Category',
      'table.thPhone': 'WhatsApp Number',
      'table.thLink': 'Invitation Link',
      'table.thActions': 'Actions',
      'table.emptyTitle': 'No Matching Data',
      'table.emptyDesc': 'No guests match your current filter or search.',
      'table.showingCount': 'Showing {count} of {total} guests',
      'table.footerInstruction': 'Click the <strong>Status</strong> badge on any row/card to toggle between <em>Sent</em> and <em>Not Sent</em>.',

      'rsvp.attending': 'Attending',
      'rsvp.declined': 'Declined',
      'rsvp.maybe': 'Maybe',
      'rsvp.pending': 'Pending',

      'card.copyLink': 'Copy Link',
      'card.copyMsg': 'Copy Message',
      'card.sendWa': 'Send WA',
      'card.viewDetail': 'View message detail',
      'card.deleteGuest': 'Delete',
      'card.deleteGuestTitle': 'Delete {name}',
      'card.statusSent': 'Sent',
      'card.statusPending': 'Not Sent',
      'card.toggleToPending': 'Click to mark as Not Sent',
      'card.toggleToSent': 'Click to mark as Sent',
      'card.withoutPhone': 'No WA',
      'card.openDirect': 'Open in WhatsApp',
      'card.markAsSent': 'Mark as Sent',
      'card.markAsPending': 'Mark as Not Sent',
      'card.preview': 'Preview',
      'card.metaSide': 'Side',
      'card.metaCategory': 'Category',
      'card.metaNote': 'Notes',
      'card.metaPhone': 'WhatsApp Number',
      'card.metaInvitation': 'Invitation',
      'card.metaRsvp': 'RSVP',

      'modal.close': 'Close',
      'modal.sendTitle': 'Send Invitation',
      'modal.waLink': 'WhatsApp Link:',
      'modal.invitationLink': 'Invitation Link:',
      'modal.copyLink': 'Copy Link',
      'modal.deleteGuest': 'Delete Guest',
      'modal.copyText': 'Copy Message Text',
      'modal.openWa': 'Open in WhatsApp',
      'modal.noPhone': 'No WhatsApp Number',

      'import.title': 'Import Guest Data',
      'import.subtitle': 'Column formats are automatically matched',
      'import.statRows': 'Total in Excel',
      'import.statRowsSub': 'Rows detected',
      'import.statReady': 'New Guests',
      'import.statReadySub': 'Ready to add',
      'import.statDup': 'Duplicates Found',
      'import.statDupSub': 'Skipped automatically',
      'import.dupAlertTitle': 'Duplicates Detected:',
      'import.selectAll': 'Select All New Guests',
      'import.thNo': 'No',
      'import.thStatus': 'Import Status',
      'import.thName': 'Guest Name',
      'import.thSide': 'Side',
      'import.thPax': 'Pax',
      'import.thPhone': 'WA Number',
      'import.thNote': 'Notes',
      'import.cancel': 'Cancel',
      'import.confirm': 'Confirm Import',
      'import.importing': 'Importing...',
      'import.statusNew': 'New Guest',
      'import.statusDuplicate': 'Duplicate (Skip)',

      'log.title': 'Activity History',
      'log.subtitle': 'Log of status changes, templates & guests with device info',
      'log.showingCount': 'Showing {count} latest activities',
      'log.loading': 'Loading history...',
      'log.emptyTitle': 'No Activity Yet',
      'log.emptyDesc': 'Activity logs for status changes, templates, and guests will be recorded automatically here.',
      'log.refresh': 'Refresh',
      'log.refreshTitle': 'Refresh History',
      'log.close': 'Close',
      'log.deviceUnknown': 'Unknown Device',

      'confirm.deleteTitle': 'Delete Guest?',
      'confirm.deleteDesc': 'Are you sure you want to delete "{name}" from the guest list? This action cannot be undone.',
      'confirm.deleteBtn': 'Yes, Delete Guest',
      'confirm.cancelBtn': 'Cancel',
      'confirm.clearTitle': 'Clear All Data?',
      'confirm.clearDesc': 'All guest data will be removed from the application. Make sure to download a backup if needed.',
      'confirm.clearBtn': 'Clear All Data',
      'confirm.markAllSentTitle': 'Mark All as Sent?',
      'confirm.markAllSentDesc': 'Mark all {count} currently displayed guests as Sent?',
      'confirm.markAllSentBtn': 'Yes, Mark Sent',
      'confirm.resetAllSentTitle': 'Reset All Delivery Statuses?',
      'confirm.resetAllSentDesc': 'Reset delivery statuses of all {count} guests back to Not Sent?',
      'confirm.resetAllSentBtn': 'Yes, Reset Status',
      'confirm.resetTemplateTitle': 'Reset Template?',
      'confirm.resetTemplateDesc': 'Are you sure you want to reset the message template to preset?',
      'confirm.resetTemplateBtn': 'Yes, Reset',

      'toast.copied': 'Copied to clipboard!',
      'toast.linkCopied': 'WhatsApp link for {name} copied!',
      'toast.linkCopiedSimple': 'WhatsApp link copied to clipboard!',
      'toast.msgCopied': 'Invitation text for {name} copied!',
      'toast.msgCopiedSimple': 'Message text copied to clipboard!',
      'toast.openingWa': 'Opening WhatsApp for {name}...',
      'toast.invalidPhone': 'WhatsApp number is invalid.',
      'toast.guestDeleted': 'Guest "{name}" successfully deleted.',
      'toast.statusUpdated': 'Status updated',
      'toast.statusMarkedSent': 'Marked as Sent!',
      'toast.statusMarkedPending': 'Marked as Not Sent.',
      'toast.markedSentName': '{name} marked as Sent',
      'toast.markedPendingName': '{name} marked as Not Sent',
      'toast.rsvpUpdated': 'RSVP for {name} updated to {status}',
      'toast.statusReverted': 'Status for {name} reverted.',
      'toast.undo': 'Undo',
      'toast.templateSaved': 'Custom template saved successfully!',
      'toast.templateReset': 'Template reset to preset.',
      'toast.allMarkedSent': 'All displayed guests marked as Sent!',
      'toast.allResetPending': 'All statuses reset to Not Sent!',
      'toast.importSuccess': 'Successfully imported {count} new guests! ({dup} duplicates skipped)',
      'toast.langChanged': 'Language switched to English',
      'toast.noLinkToCopy': 'No link available to copy.',
      'toast.noTextToCopy': 'No text available to copy.',
      'toast.tagInserted': 'Tag {tag} inserted!',

      'time.justNow': 'Just now',
      'time.minAgo': '{m}m ago',
      'time.hourAgo': '{h}h ago',
      'time.dayAgo': '{d}d ago',

      'footer.wedding': 'Wedding Invitation',
      'footer.sync': 'Sync active 🟢',
      'footer.syncConnecting': 'Connecting...',
      'footer.syncOffline': 'Cloud Saved (Polling) 🟢',
      'footer.langLabel': 'Language:',

      'fileStatus.saved': 'Data saved (Supabase)',
      'fileStatus.detected': '{count} guests detected'
    },
    id: {
      'pin.title': 'Masukkan PIN Keamanan',
      'pin.subtitle': 'Masukkan PIN untuk mengakses aplikasi',
      'pin.placeholder': 'Masukkan PIN',
      'pin.error': 'PIN salah. Coba lagi.',
      'pin.unlock': 'Buka Akses',
      'pin.verifying': 'Memverifikasi...',
      'pin.hint': '💍 Hanya untuk Dhifa & Riefky',

      'app.title': 'Viding WA Generator',
      'app.subtitle': 'Generator Link WhatsApp & Template Pesan Undangan',
      'app.history': 'Riwayat',
      'app.historyTitle': 'Lihat Riwayat Aktivitas & Info Device',

      'stat.totalGuests': 'Total Undangan',
      'stat.sent': 'Sudah Dikirim',
      'stat.pending': 'Belum Dikirim',
      'stat.syncConnecting': 'Menghubungkan...',
      'stat.syncActive': 'Sinkronisasi aktif 🟢',
      'stat.syncOffline': 'Cloud Tersimpan (Polling) 🟢',
      'stat.syncTitle': 'Status sinkronisasi Realtime',
      'stat.guestSingular': 'Tamu',
      'stat.guestsSuffix': 'Tamu',
      'stat.progressGuests': 'Undangan',

      'config.toggleTitle': 'Pengaturan Data & Template',
      'config.toggleHint': 'Buka/Tutup',

      'source.title': 'Sumber Data Excel',
      'source.subtitle': 'Pilih file undangan Excel (.xlsx / .xls)',
      'source.dropzoneMain': 'Klik atau seret file <strong>Excel (.xlsx / .xls)</strong> ke sini',
      'source.dropzoneSub': 'Tambahkan tamu baru tanpa menimpa data yang ada (otomatis cek duplikat)',
      'source.tagsTitle': 'Tag Kolom yang Tersedia:',
      'source.tagsDesc': 'Klik tag di bawah untuk menyisipkan ke pesan',

      'template.title': 'Template Pesan WhatsApp',
      'template.subtitle': 'Sesuaikan pesan dengan placeholder otomatis',
      'template.presetFormal': '💍 Format Resmi (Formal)',
      'template.presetCasual': '🌿 Format Santai (Teman/Sahabat)',
      'template.presetSingkat': '⚡ Format Singkat (Reminder)',
      'template.presetCustom': '✏️ Template Kustom Saya',
      'template.placeholder': 'Tuliskan format pesan undangan di sini... Gunakan tag seperti [Sapaan], [Nama], [Link]',
      'template.charsWords': '{chars} karakter | {words} kata',
      'template.save': 'Simpan',
      'template.saveTitle': 'Simpan sebagai template kustom',
      'template.reset': 'Reset',
      'template.resetTitle': 'Kembalikan ke format awal',
      'template.previewTitle': 'Tampilan di WhatsApp Penerima:',
      'template.previewFor': 'Preview untuk:',

      'table.title': 'Daftar Penerima Undangan & Generator WhatsApp',
      'table.subtitle': 'Kelola pengiriman, salin link WhatsApp, atau kirim langsung ke WhatsApp',
      'table.progressLabel': 'Progress Pengiriman:',
      'table.searchPlaceholder': 'Cari nama, WA, label...',
      'table.clearSearch': 'Hapus pencarian',
      'table.filterSideTitle': 'Filter Catatan / Pihak',
      'table.filterSidePrefix': 'Filter: ',
      'table.sideAll': 'Semua',
      'table.sideGroomBride': 'Pihak Pengantin',
      'table.sideFamily': 'Keluarga',
      'table.filterRsvpTitle': 'Filter Kehadiran RSVP',
      'table.filterRsvpPrefix': 'RSVP: ',
      'table.rsvpAll': 'Semua RSVP',
      'table.rsvpSummaryTitle': 'RSVP:',
      'table.tabAll': 'Semua',
      'table.tabPending': '⏳ Belum Kirim',
      'table.tabSent': '🟢 Sudah Kirim',
      'table.markAllSent': 'Tandai Terkirim',
      'table.markAllSentTitle': 'Tandai seluruh baris yang tampil sebagai Terkirim',
      'table.resetAllSent': 'Reset Status',
      'table.resetAllSentTitle': 'Reset semua status pengiriman ke Belum Kirim',
      'table.thNo': 'No',
      'table.thStatus': 'Status Kirim',
      'table.thRsvp': 'Status RSVP',
      'table.thName': 'Nama Tamu & Kategori',
      'table.thPhone': 'Nomor WhatsApp',
      'table.thLink': 'Link Undangan',
      'table.thActions': 'Aksi',
      'table.emptyTitle': 'Tidak Ada Data yang Sesuai',
      'table.emptyDesc': 'Tidak ada tamu yang cocok dengan filter atau pencarian Anda saat ini.',
      'table.showingCount': 'Menampilkan {count} dari {total} undangan',
      'table.footerInstruction': 'Klik badge <strong>Status</strong> pada baris/kartu untuk mengubah status antara <em>Sudah Dikirim</em> dan <em>Belum Dikirim</em>.',

      'rsvp.attending': 'Hadir',
      'rsvp.declined': 'Tidak Hadir',
      'rsvp.maybe': 'Ragu-ragu',
      'rsvp.pending': 'Belum Respons',

      'card.copyLink': 'Salin Link',
      'card.copyMsg': 'Salin Pesan',
      'card.sendWa': 'Kirim WA',
      'card.viewDetail': 'Lihat detail pesan',
      'card.deleteGuest': 'Hapus',
      'card.deleteGuestTitle': 'Hapus {name}',
      'card.statusSent': 'Sudah Kirim',
      'card.statusPending': 'Belum Kirim',
      'card.toggleToPending': 'Klik untuk tandai Belum Dikirim',
      'card.toggleToSent': 'Klik untuk tandai Sudah Dikirim',
      'card.withoutPhone': 'No WA',
      'card.openDirect': 'Buka di WhatsApp',
      'card.markAsSent': 'Tandai Sudah Terkirim',
      'card.markAsPending': 'Tandai Belum Terkirim',
      'card.preview': 'Preview',
      'card.metaSide': 'Pihak',
      'card.metaCategory': 'Kategori',
      'card.metaNote': 'Catatan',
      'card.metaPhone': 'Nomor WA',
      'card.metaInvitation': 'Undangan',
      'card.metaRsvp': 'RSVP',

      'modal.close': 'Tutup',
      'modal.sendTitle': 'Kirim Undangan',
      'modal.waLink': 'Link WhatsApp:',
      'modal.invitationLink': 'Link Undangan:',
      'modal.copyLink': 'Salin Link',
      'modal.deleteGuest': 'Hapus Tamu',
      'modal.copyText': 'Salin Teks Pesan',
      'modal.openWa': 'Buka di WhatsApp',
      'modal.noPhone': 'Tanpa Nomor WhatsApp',

      'import.title': 'Impor Data Tamu',
      'import.subtitle': 'Format kolom otomatis disesuaikan',
      'import.statRows': 'Total di Excel',
      'import.statRowsSub': 'Baris terdeteksi',
      'import.statReady': 'Tamu Baru',
      'import.statReadySub': 'Siap ditambahkan',
      'import.statDup': 'Duplikat Ditemukan',
      'import.statDupSub': 'Dilewati otomatis',
      'import.dupAlertTitle': 'Duplikasi Terdeteksi:',
      'import.selectAll': 'Pilih Semua Tamu Baru',
      'import.thNo': 'No',
      'import.thStatus': 'Status Impor',
      'import.thName': 'Nama Tamu',
      'import.thSide': 'Pihak',
      'import.thPax': 'Pax',
      'import.thPhone': 'Nomor WA',
      'import.thNote': 'Catatan',
      'import.cancel': 'Batal',
      'import.confirm': 'Konfirmasi Tambahkan',
      'import.importing': 'Mengimpor...',
      'import.statusNew': 'Tamu Baru',
      'import.statusDuplicate': 'Duplikat (Lewati)',

      'log.title': 'Riwayat Aktivitas',
      'log.subtitle': 'Catatan perubahan status, template & tamu beserta info perangkat',
      'log.showingCount': 'Menampilkan {count} aktivitas terbaru',
      'log.loading': 'Memuat riwayat...',
      'log.emptyTitle': 'Belum Ada Riwayat',
      'log.emptyDesc': 'Aktivitas perubahan status, template, dan tamu akan tercatat otomatis di sini.',
      'log.refresh': 'Segarkan',
      'log.refreshTitle': 'Muat Ulang Riwayat',
      'log.close': 'Tutup',
      'log.deviceUnknown': 'Perangkat Tidak Dikenal',

      'confirm.deleteTitle': 'Hapus Tamu?',
      'confirm.deleteDesc': 'Apakah Anda yakin ingin menghapus "{name}" dari daftar undangan? Tindakan ini tidak dapat dibatalkan.',
      'confirm.deleteBtn': 'Ya, Hapus Tamu',
      'confirm.cancelBtn': 'Batal',
      'confirm.clearTitle': 'Bersihkan Semua Data?',
      'confirm.clearDesc': 'Semua data penerima undangan akan dihapus dari aplikasi. Pastikan Anda sudah mengunduh data jika masih diperlukan.',
      'confirm.clearBtn': 'Hapus Semua Data',
      'confirm.markAllSentTitle': 'Tandai Semua Terkirim?',
      'confirm.markAllSentDesc': 'Tandai seluruh {count} tamu yang tampil saat ini sebagai Sudah Dikirim?',
      'confirm.markAllSentBtn': 'Ya, Tandai Terkirim',
      'confirm.resetAllSentTitle': 'Reset Semua Status Pengiriman?',
      'confirm.resetAllSentDesc': 'Kembalikan status pengiriman seluruh {count} tamu ke Belum Dikirim?',
      'confirm.resetAllSentBtn': 'Ya, Reset Status',
      'confirm.resetTemplateTitle': 'Reset Template?',
      'confirm.resetTemplateDesc': 'Kembalikan template pesan ke format awal?',
      'confirm.resetTemplateBtn': 'Ya, Reset',

      'toast.copied': 'Tersalin ke clipboard!',
      'toast.linkCopied': 'Link WhatsApp untuk {name} berhasil disalin!',
      'toast.linkCopiedSimple': 'Link WhatsApp berhasil disalin!',
      'toast.msgCopied': 'Teks undangan untuk {name} disalin!',
      'toast.msgCopiedSimple': 'Teks pesan berhasil disalin!',
      'toast.openingWa': 'Membuka WhatsApp untuk {name}...',
      'toast.invalidPhone': 'Nomor WhatsApp belum valid.',
      'toast.guestDeleted': 'Tamu "{name}" berhasil dihapus.',
      'toast.statusUpdated': 'Status diperbarui',
      'toast.statusMarkedSent': 'Ditandai Sudah Dikirim!',
      'toast.statusMarkedPending': 'Ditandai Belum Dikirim.',
      'toast.markedSentName': '{name} ditandai Sudah Terkirim',
      'toast.markedPendingName': '{name} ditandai Belum Terkirim',
      'toast.rsvpUpdated': 'Status RSVP {name} diperbarui ke {status}',
      'toast.statusReverted': 'Status {name} dikembalikan.',
      'toast.undo': 'Urungkan',
      'toast.templateSaved': 'Template kustom berhasil disimpan!',
      'toast.templateReset': 'Template dikembalikan ke format awal.',
      'toast.allMarkedSent': 'Semua tamu yang tampil ditandai Terkirim!',
      'toast.allResetPending': 'Semua status direset ke Belum Kirim!',
      'toast.importSuccess': 'Berhasil menambahkan {count} tamu baru! ({dup} duplikat dilewati)',
      'toast.langChanged': 'Bahasa berhasil diubah ke Bahasa Indonesia',
      'toast.noLinkToCopy': 'Tidak ada tautan untuk disalin.',
      'toast.noTextToCopy': 'Tidak ada teks untuk disalin.',
      'toast.tagInserted': 'Tag {tag} disisipkan!',

      'time.justNow': 'Baru saja',
      'time.minAgo': '{m} mnt lalu',
      'time.hourAgo': '{h} jam lalu',
      'time.dayAgo': '{d} hari lalu',

      'footer.wedding': 'Undangan Pernikahan',
      'footer.sync': 'Sinkronisasi aktif 🟢',
      'footer.syncConnecting': 'Menghubungkan...',
      'footer.syncOffline': 'Cloud Tersimpan (Polling) 🟢',
      'footer.langLabel': 'Bahasa:',

      'fileStatus.saved': 'Data tersimpan (Supabase)',
      'fileStatus.detected': '{count} Tamu Undangan terdeteksi'
    }
  };

  let currentLang = localStorage.getItem('guesty_lang') || 'en';

  function t(key, params = {}) {
    let str = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
              (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) ||
              key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(k => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
      });
    }
    return str;
  }

  function formatPaxText(pax) {
    const count = parseInt(pax, 10) || 0;
    return `${count} ${count === 1 ? t('stat.guestSingular') : t('stat.guestsSuffix')}`;
  }

  function getSideFilterLabel(side) {
    const prefix = t('table.filterSidePrefix');
    if (side === 'all') return `${prefix}${t('table.sideAll')}`;
    if (side === 'dhifa') return `${prefix}🌸 Dhifa`;
    if (side === 'riefky') return `${prefix}💼 Riefky`;
    if (side === 'abi') return `${prefix}🧔 Abi`;
    if (side === 'umi') return `${prefix}🧕 Umi`;
    if (side === 'papa') return `${prefix}👨 Papa`;
    if (side === 'mama') return `${prefix}👩 Mama`;
    return `${prefix}${t('table.sideAll')}`;
  }

  function updateSideFilterLabels() {
    if (dom.sideFilterSelectedText) {
      dom.sideFilterSelectedText.textContent = getSideFilterLabel(state.currentSideFilter || 'all');
    }
  }

  function getRsvpFilterLabel(rsvp) {
    const prefix = t('table.filterRsvpPrefix');
    if (rsvp === 'all') return `${prefix}${t('table.rsvpAll')}`;
    if (rsvp === 'attending') return `${prefix}🟢 ${t('rsvp.attending')}`;
    if (rsvp === 'declined') return `${prefix}🔴 ${t('rsvp.declined')}`;
    if (rsvp === 'maybe') return `${prefix}🟡 ${t('rsvp.maybe')}`;
    if (rsvp === 'pending') return `${prefix}⚪ ${t('rsvp.pending')}`;
    return `${prefix}${t('table.rsvpAll')}`;
  }

  function updateRsvpFilterLabels() {
    if (dom.rsvpFilterSelectedText) {
      dom.rsvpFilterSelectedText.textContent = getRsvpFilterLabel(state.currentRsvpFilter || 'all');
    }
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;

    // 1. data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.innerHTML = t(key);
    });

    // 2. data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = t(key);
    });

    // 3. data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = t(key);
    });

    // 4. Preset dropdown options
    if (dom.templatePresetSelect) {
      const opts = dom.templatePresetSelect.options;
      for (let i = 0; i < opts.length; i++) {
        const val = opts[i].value;
        if (val === 'formal') opts[i].textContent = t('template.presetFormal');
        else if (val === 'casual') opts[i].textContent = t('template.presetCasual');
        else if (val === 'singkat') opts[i].textContent = t('template.presetSingkat');
        else if (val === 'custom') opts[i].textContent = t('template.presetCustom');
      }
    }

    // 5. Update side & RSVP filter UI
    updateSideFilterLabels();
    updateRsvpFilterLabels();

    // 6. Update language switcher toggles
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
      const isMatch = btn.dataset.lang === currentLang;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    // 7. Update character counter
    updateCharCounter();

    // 8. Re-render dynamic components if ready
    if (typeof setSyncStatus === 'function') setSyncStatus();
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderTable === 'function') renderTable();

    setupLucideIcons();
  }

  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('guesty_lang', lang);
    applyLanguage();
    showToast(t('toast.langChanged'), 'info');
  }

  function initLanguage() {
    applyLanguage();

    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = btn.dataset.lang;
        if (selectedLang && selectedLang !== currentLang) {
          setLanguage(selectedLang);
        }
      });
    });
  }

  // ===========================================================================
  // State
  // ===========================================================================
  const state = {
    rawRows: [],
    columns: [],
    phoneColumn: '',
    currentFilter: 'all',
    currentSideFilter: 'all',
    currentRsvpFilter: 'all',
    searchQuery: '',
    selectedPreviewIndex: 0,
    sentStatuses: {},
    rsvpStatuses: {},
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
    rsvpDropdownContainer: document.getElementById('rsvpDropdownContainer'),
    btnRsvpFilterDropdown: document.getElementById('btnRsvpFilterDropdown'),
    rsvpFilterDropdownMenu: document.getElementById('rsvpFilterDropdownMenu'),
    rsvpFilterSelectedText: document.getElementById('rsvpFilterSelectedText'),
    rsvpSummaryBar: document.getElementById('rsvpSummaryBar'),
    rsvpSummaryAttending: document.getElementById('rsvpSummaryAttending'),
    rsvpSummaryDeclined: document.getElementById('rsvpSummaryDeclined'),
    rsvpSummaryMaybe: document.getElementById('rsvpSummaryMaybe'),
    rsvpSummaryPending: document.getElementById('rsvpSummaryPending'),
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
                <div style="display:flex;gap:6px;">
                  <span class="shimmer skeleton-pill" style="width: 48px; height: 18px;"></span>
                  <span class="shimmer skeleton-pill" style="width: 60px; height: 18px;"></span>
                </div>
              </div>
            </td>
            <td class="col-phone"><span class="shimmer skeleton-text" style="width: 110px;"></span></td>
            <td class="col-link"><span class="shimmer skeleton-text" style="width: 140px;"></span></td>
            <td class="col-actions">
              <div class="skeleton-cell-actions">
                <span class="shimmer skeleton-badge" style="width: 72px; height: 32px; border-radius: 20px;"></span>
                <span class="shimmer skeleton-badge" style="width: 84px; height: 32px; border-radius: 20px;"></span>
                <span class="shimmer skeleton-badge" style="width: 110px; height: 32px; border-radius: 20px;"></span>
                <span class="shimmer skeleton-circle" style="width: 32px; height: 32px;"></span>
                <span class="shimmer skeleton-circle" style="width: 32px; height: 32px;"></span>
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
              <span class="shimmer skeleton-circle" style="width: 40px; height: 40px; flex-shrink: 0;"></span>
              <div class="mobile-skeleton-left">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="shimmer skeleton-badge" style="width: 24px; height: 13px;"></span>
                  <span class="shimmer skeleton-title" style="width: 130px;"></span>
                </div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                  <span class="shimmer skeleton-pill" style="width: 42px; height: 18px;"></span>
                  <span class="shimmer skeleton-pill" style="width: 55px; height: 18px;"></span>
                </div>
              </div>
              <div class="mobile-skeleton-right">
                <span class="shimmer skeleton-circle" style="width: 20px; height: 20px;"></span>
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
  // PIN Gate (Disabled by request - toggle PIN_PROTECTION_ENABLED to re-enable)
  // ===========================================================================
  const PIN_PROTECTION_ENABLED = false;

  function isUnlocked() {
    if (!PIN_PROTECTION_ENABLED) return true;
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
    if (!PIN_PROTECTION_ENABLED || isUnlocked()) {
      if (dom.pinOverlay) dom.pinOverlay.style.display = 'none';
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

  function closeModalWithAnimation(modalOverlayEl, callback) {
    if (!modalOverlayEl || modalOverlayEl.style.display === 'none') return;
    modalOverlayEl.classList.add('is-closing');
    setTimeout(() => {
      modalOverlayEl.style.display = 'none';
      modalOverlayEl.classList.remove('is-closing');
      if (typeof callback === 'function') callback();
    }, 220);
  }

  function closeConfirmModal() {
    if (!dom.customConfirmModal) return;
    closeModalWithAnimation(dom.customConfirmModal, () => {
      pendingConfirmAction = null;
    });
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
  let currentSyncStatus = 'connecting';
  function setSyncStatus(status) {
    if (status) currentSyncStatus = status;
    const isConnecting = currentSyncStatus === 'connecting';
    const isLive = currentSyncStatus === 'live';
    const dot = isConnecting ? 'sync-dot-connecting' : (isLive ? 'sync-dot-live' : 'sync-dot-offline');
    const label = isConnecting ? t('stat.syncConnecting') : (isLive ? (currentLang === 'en' ? 'Realtime Active' : 'Realtime Aktif') : (currentLang === 'en' ? 'Cloud Saved' : 'Cloud Tersimpan'));
    const footer = isConnecting ? (currentLang === 'en' ? '🔵 Connecting' : '🔵 Menghubungkan') : (isLive ? t('footer.sync') : t('footer.syncOffline'));

    if (dom.syncDot) dom.syncDot.className = `sync-dot ${dot}`;
    if (dom.syncLabel) dom.syncLabel.textContent = label;
    if (dom.mobileSyncDot) dom.mobileSyncDot.className = `sync-dot ${dot}`;
    if (dom.mobileSyncLabel) dom.mobileSyncLabel.textContent = label;
    if (dom.footerSyncStatus) dom.footerSyncStatus.textContent = footer;
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
  // RSVP Attendance Status (Supabase-backed)
  // ===========================================================================
  const RSVP_STATES = {
    attending: { id: 'attending', emoji: '🟢', labelKey: 'rsvp.attending', class: 'rsvp-attending' },
    declined: { id: 'declined', emoji: '🔴', labelKey: 'rsvp.declined', class: 'rsvp-declined' },
    maybe: { id: 'maybe', emoji: '🟡', labelKey: 'rsvp.maybe', class: 'rsvp-maybe' },
    pending: { id: 'pending', emoji: '⚪', labelKey: 'rsvp.pending', class: 'rsvp-pending' }
  };

  async function loadRsvpStatuses() {
    try {
      const data = await apiGet('/api/rsvp-status');
      state.rsvpStatuses = data.rsvpStatuses || {};
    } catch (e) {
      console.warn('Could not load RSVP statuses from Supabase', e);
      state.rsvpStatuses = {};
    }
  }

  function getRowRsvp(row, index) {
    const key = getRowKey(row, index);
    return state.rsvpStatuses[key] || 'pending';
  }

  function getRsvpConfig(status) {
    return RSVP_STATES[status] || RSVP_STATES.pending;
  }

  function getRsvpLabel(status) {
    const cfg = getRsvpConfig(status);
    return `${cfg.emoji} ${t(cfg.labelKey)}`;
  }

  async function persistRsvpStatus(guestKey, status) {
    try {
      await apiPost('/api/rsvp-status', { guestKey, status });
    } catch (e) {
      console.warn('Failed to sync RSVP status to Supabase', e);
    }
    if (status && status !== 'pending') {
      state.rsvpStatuses[guestKey] = status;
    } else {
      delete state.rsvpStatuses[guestKey];
    }
  }

  async function setRowRsvp(row, index, newStatus) {
    const key = getRowKey(row, index);
    const guestName = (row['Nama'] || row['Name'] || 'Tamu').trim();
    if (newStatus && newStatus !== 'pending') {
      state.rsvpStatuses[key] = newStatus;
    } else {
      delete state.rsvpStatuses[key];
    }
    updateStatsAndProgress();
    renderTable();
    broadcastRealtimeEvent('rsvp_status_updated', { guestKey: key, status: newStatus, guestName });
    await persistRsvpStatus(key, newStatus);
    logActivity({
      action: 'RSVP_STATUS_UPDATED',
      summary: `RSVP "${guestName}" diubah ke ${getRsvpLabel(newStatus)}`,
      details: { guestKey: key, guestName, status: newStatus }
    });
  }

  // ===========================================================================
  // Supabase Realtime Subscription & Multi-Device Sync
  // ===========================================================================
  let realtimeChannel = null;
  let realtimePollingTimer = null;
  let isSyncingFromCloud = false;
  let isLocalMutationInProgress = false;
  let renderDebounceTimer = null;

  function scheduleTableRender() {
    if (renderDebounceTimer) cancelAnimationFrame(renderDebounceTimer);
    renderDebounceTimer = requestAnimationFrame(() => {
      updateStatsAndProgress();
      renderTable();
      renderDebounceTimer = null;
    });
  }

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
    if (isSyncingFromCloud || isLocalMutationInProgress) return;
    isSyncingFromCloud = true;
    try {
      // Fetch guests, sent-status, and rsvp-status concurrently so they are updated together without a blip
      const [guestsRes, statusRes, rsvpRes] = await Promise.all([
        apiGet('/api/guests').catch(err => { console.warn(err); return null; }),
        apiGet('/api/sent-status').catch(err => { console.warn(err); return null; }),
        apiGet('/api/rsvp-status').catch(err => { console.warn(err); return null; })
      ]);

      let hasChanged = false;

      // 1. Process guests
      const guests = guestsRes ? guestsRes.guests : null;
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
          updateLivePreview();
          hasChanged = true;
        }
      }

      // 2. Process sent statuses
      if (statusRes && statusRes.sentStatuses) {
        const currentStatusesJson = JSON.stringify(state.sentStatuses);
        const newStatusesJson = JSON.stringify(statusRes.sentStatuses);
        if (currentStatusesJson !== newStatusesJson) {
          state.sentStatuses = statusRes.sentStatuses;
          hasChanged = true;
        }
      }

      // 3. Process RSVP statuses
      if (rsvpRes && rsvpRes.rsvpStatuses) {
        const currentRsvpJson = JSON.stringify(state.rsvpStatuses);
        const newRsvpJson = JSON.stringify(rsvpRes.rsvpStatuses);
        if (currentRsvpJson !== newRsvpJson) {
          state.rsvpStatuses = rsvpRes.rsvpStatuses;
          hasChanged = true;
        }
      }

      // Render only once when rows, sent-statuses, and rsvp-statuses are aligned
      if (hasChanged) {
        updateStatsAndProgress();
        renderTable();
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
        if (isLocalMutationInProgress) return;
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
        if (isLocalMutationInProgress) return;
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
      .on('broadcast', { event: 'rsvp_status_updated' }, (msg) => {
        const data = msg.payload || msg;
        if (data && data.guestKey) {
          if (data.status && data.status !== 'pending') {
            state.rsvpStatuses[data.guestKey] = data.status;
          } else {
            delete state.rsvpStatuses[data.guestKey];
          }
          updateStatsAndProgress();
          renderTable();
          const guestName = data.guestName || getGuestNameByKey(data.guestKey) || 'Tamu';
          const rsvpLabel = getRsvpLabel(data.status || 'pending');
          showToast(`📋 RSVP '${guestName}' diubah ke ${rsvpLabel}`, 'success');
          highlightRealtimeRow(data.guestKey);
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
        if (isLocalMutationInProgress) return;
        await reloadGuestsAndStatusesFromCloud();
      });

    // C. Listen for Postgres CDC Changes on sent_statuses table
    realtimeChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sent_statuses'
      }, (payload) => {
        if (isLocalMutationInProgress) return;
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
        scheduleTableRender();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rsvp_statuses'
      }, (payload) => {
        if (isLocalMutationInProgress) return;
        const { new: newRow, old: oldRow, eventType } = payload;
        if (eventType === 'DELETE' && oldRow?.guest_key) {
          delete state.rsvpStatuses[oldRow.guest_key];
        } else if (newRow?.guest_key) {
          if (newRow.status && newRow.status !== 'pending') {
            state.rsvpStatuses[newRow.guest_key] = newRow.status;
          } else {
            delete state.rsvpStatuses[newRow.guest_key];
          }
        }
        scheduleTableRender();
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
        processRows(rows, t('fileStatus.saved'));
        return true;
      }
    } catch (e) {
      console.warn('Could not load guests from Supabase', e);
    }
    return false;
  }

  async function saveGuestsToSupabase(rows, sentStatuses = null, shouldBroadcast = true, rsvpStatuses = null) {
    try {
      const payload = { rows };
      if (sentStatuses && typeof sentStatuses === 'object') {
        payload.sentStatuses = sentStatuses;
      }
      if (rsvpStatuses && typeof rsvpStatuses === 'object') {
        payload.rsvpStatuses = rsvpStatuses;
      }
      await apiPost('/api/guests', payload);
      if (shouldBroadcast) {
        broadcastRealtimeEvent('guest_list_updated', { action: 'update', count: rows.length });
      }
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
      title: t('confirm.deleteTitle'),
      message: t('confirm.deleteDesc', { name: guestName }),
      icon: 'trash-2',
      theme: 'danger',
      confirmText: t('confirm.deleteBtn'),
      cancelText: t('confirm.cancelBtn'),
      onConfirm: async () => {
        await deleteGuestAtIndex(index, guestName);
      }
    });
  }

  async function deleteGuestAtIndex(index, guestName) {
    if (index < 0 || index >= state.rawRows.length) return;

    // 1. Lock mutations to ignore any incoming CDC echo events or background polling
    isLocalMutationInProgress = true;

    // 2. Preserve isSent and RSVP status for each row
    const isSentArray = state.rawRows.map((r, i) => isRowSent(r, i));
    const rsvpArray = state.rawRows.map((r, i) => getRowRsvp(r, i));

    // 3. Remove row from local state
    state.rawRows.splice(index, 1);
    isSentArray.splice(index, 1);
    rsvpArray.splice(index, 1);

    // 4. Rebuild sentStatuses and rsvpStatuses mapped to new shifted row keys
    const newSentStatuses = {};
    const newRsvpStatuses = {};
    state.rawRows.forEach((r, i) => {
      if (isSentArray[i]) {
        newSentStatuses[getRowKey(r, i)] = true;
      }
      if (rsvpArray[i] && rsvpArray[i] !== 'pending') {
        newRsvpStatuses[getRowKey(r, i)] = rsvpArray[i];
      }
    });
    state.sentStatuses = newSentStatuses;
    state.rsvpStatuses = newRsvpStatuses;

    // 5. Adjust expanded index if mobile card was expanded
    if (state.expandedGuestIndex === index) {
      state.expandedGuestIndex = null;
    } else if (state.expandedGuestIndex !== null && state.expandedGuestIndex > index) {
      state.expandedGuestIndex--;
    }

    // 6. Adjust preview selection if deleted guest was selected
    if (state.selectedPreviewIndex >= state.rawRows.length) {
      state.selectedPreviewIndex = Math.max(0, state.rawRows.length - 1);
    }

    // 7. OPTIMISTIC INSTANT UI UPDATE: smooth, immediate, zero blip
    updateFileStatusBar(null, state.rawRows.length);
    populatePreviewGuestDropdown();
    renderTable();
    updateStatsAndProgress();
    updateLivePreview();
    showToast(t('toast.guestDeleted', { name: guestName }), 'success');

    // 8. Persist atomically to Supabase (guests + sentStatuses + rsvpStatuses in a single request)
    try {
      await saveGuestsToSupabase(state.rawRows, state.sentStatuses, false, state.rsvpStatuses);
    } catch (e) {
      console.warn('Failed to sync guest deletion to cloud', e);
    }

    // 9. Broadcast updates to all other connected devices
    broadcastRealtimeEvent('guest_list_updated', { action: 'delete', name: guestName, count: state.rawRows.length });
    broadcastRealtimeEvent('bulk_status_updated', { sentStatuses: state.sentStatuses });

    logActivity({
      action: 'GUEST_DELETED',
      summary: `Menghapus tamu "${guestName}" dari daftar undangan`,
      details: { guestName }
    });

    // 10. Keep mutation lock active for a grace period so incoming echo CDC events don't flicker
    setTimeout(() => {
      isLocalMutationInProgress = false;
    }, 2000);
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
  let isImporting = false;

  function extractGuestIdentity(row, phoneCol) {
    const rawName = (row['Nama'] || row['Name'] || '').toString().trim();
    const lowerName = rawName.toLowerCase();

    // 1. Notes (Dhifa/Riefky)
    const side = getGuestSide(row);
    const rawNote = getGuestNote(row);
    // Standardize recognized side (dhifa/riefky/abi/umi/papa/mama) or fall back to raw note trimmed
    const noteVal = side ? side.toLowerCase() : rawNote.trim().toLowerCase();

    // 2. Label / Kategori
    const label = (row['Label'] || row['label'] || row['Kategori'] || row['kategori'] || row['Category'] || row['category'] || '').toString().trim();
    const labelVal = label.toLowerCase();

    // 3. Phone number
    const col = phoneCol || state.phoneColumn || detectPhoneColumn(Object.keys(row || {}));
    const rawPhone = (col && row[col] !== undefined && row[col] !== null)
      ? row[col]
      : (row['Nomor WhatsApp'] || row['No WhatsApp'] || row['WhatsApp'] || row['Phone'] || row['No HP'] || row['HP'] || '');
    const phoneInfo = normalizePhone(rawPhone);
    const phoneVal = phoneInfo.formatted || (rawPhone ? rawPhone.toString().replace(/[^0-9]/g, '') : '');

    return {
      rawName,
      lowerName,
      side,
      note: rawNote,
      noteVal,
      label,
      labelVal,
      phoneInfo,
      phoneVal
    };
  }

  function isGuestDuplicate(candidate, reference) {
    // 0. Name check: if name is different, not duplicate
    if (!candidate.lowerName || !reference.lowerName || candidate.lowerName !== reference.lowerName) {
      return false;
    }

    // Name is the same. Check sequentially:
    // If one of them is different, do NOT mark as duplicate name.

    // 1. Check notes (Dhifa/Riefky)
    if (candidate.noteVal !== reference.noteVal) {
      return false;
    }

    // 2. Check label
    if (candidate.labelVal !== reference.labelVal) {
      return false;
    }

    // 3. Check phone number
    if (candidate.phoneVal !== reference.phoneVal) {
      return false;
    }

    // None of them is different (name, notes, label, and phone all match) -> duplicate!
    return true;
  }

  function openImportPreviewModal(incomingRows, filename) {
    if (!incomingRows || incomingRows.length === 0) {
      showToast('File Excel kosong atau tidak memiliki data.', 'danger');
      return;
    }

    pendingImportFilename = filename || 'Data Excel';

    const phoneCol = detectPhoneColumn(Object.keys(incomingRows[0] || {}));

    // Extract identities of all existing guests in state.rawRows
    const existingGuestIdentities = (state.rawRows || []).map(r => 
      extractGuestIdentity(r, state.phoneColumn)
    );

    // Keep track of non-duplicate incoming guests accepted from this batch
    const incomingAcceptedIdentities = [];

    const allParsedItems = incomingRows.map((row, idx) => {
      const candidate = extractGuestIdentity(row, phoneCol);
      const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;

      // Sequential duplicate check:
      // If same name, check notes (Dhifa/Riefky), label, and phone.
      // If any of them is different, it is NOT marked as duplicate.
      const matchedExisting = candidate.lowerName
        ? existingGuestIdentities.find(existing => isGuestDuplicate(candidate, existing))
        : null;

      const matchedBatch = (!matchedExisting && candidate.lowerName)
        ? incomingAcceptedIdentities.find(earlier => isGuestDuplicate(candidate, earlier))
        : null;

      const isAlreadyInList = !!matchedExisting;
      const isDuplicateInBatch = !!matchedBatch;
      const isDuplicate = isAlreadyInList || isDuplicateInBatch;

      if (!isDuplicate && candidate.lowerName) {
        incomingAcceptedIdentities.push(candidate);
      }

      return {
        row,
        index: idx,
        name: candidate.rawName || `Tamu #${idx + 1}`,
        isDuplicate,
        duplicateReason: isAlreadyInList ? 'Sudah ada di daftar tamu' : (isDuplicateInBatch ? 'Duplikat dalam file Excel ini' : ''),
        side: candidate.side,
        note: candidate.note,
        label: candidate.label,
        pax,
        phoneInfo: candidate.phoneInfo,
        selected: !isDuplicate // New guests checked by default, duplicates unchecked
      };
    });

    // Prioritize non-duplicate (new) guests first, maintaining relative order in each group
    const newCandidates = allParsedItems.filter(i => !i.isDuplicate);
    const dupCandidates = allParsedItems.filter(i => i.isDuplicate);
    pendingImportItems = [...newCandidates, ...dupCandidates];

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

    // Render Rows in Import Table (Grouped with New Guests First)
    dom.importPreviewTableBody.innerHTML = '';

    const renderItemRow = (item, displayIdx) => {
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
      tdNo.textContent = displayIdx;

      // Status Impor
      const tdStatus = document.createElement('td');
      tdStatus.className = 'import-col-status';
      if (item.isDuplicate) {
        tdStatus.innerHTML = `<span class="badge-import-dup" title="${escapeHtml(item.duplicateReason)}"><i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> ${t('import.statusDuplicate')}</span>`;
      } else {
        tdStatus.innerHTML = `<span class="badge-import-new"><i data-lucide="check" style="width:12px;height:12px;"></i> ${t('import.statusNew')}</span>`;
      }

      // Nama Tamu
      const tdName = document.createElement('td');
      tdName.innerHTML = `<span class="import-guest-name">${escapeHtml(item.name)}</span>`;
      if (item.label) {
        tdName.innerHTML += ` <span class="mobile-category-badge" style="font-size:0.68rem;padding:1px 6px;vertical-align:middle;">${escapeHtml(item.label)}</span>`;
      }
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
        : `<span style="color:var(--slate-400);font-size:0.75rem;">${t('card.withoutPhone')}</span>`;

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
    };

    // 1. Prioritize and render New Guests Section
    if (newItems.length > 0) {
      const trHeaderNew = document.createElement('tr');
      trHeaderNew.className = 'import-section-header import-section-new';
      trHeaderNew.innerHTML = `
        <td colspan="8">
          <div class="import-section-badge">
            <i data-lucide="user-check" style="width:14px;height:14px;"></i>
            <span>Tamu Baru (${newItems.length}) — Siap Diimpor</span>
          </div>
        </td>
      `;
      dom.importPreviewTableBody.appendChild(trHeaderNew);
      newItems.forEach((item, idx) => renderItemRow(item, idx + 1));
    }

    // 2. Render Duplicate Guests Section (Grouped below, skipped)
    if (dupItems.length > 0) {
      const trHeaderDup = document.createElement('tr');
      trHeaderDup.className = 'import-section-header import-section-dup';
      trHeaderDup.innerHTML = `
        <td colspan="8">
          <div class="import-section-badge">
            <i data-lucide="alert-triangle" style="width:14px;height:14px;"></i>
            <span>Duplikat Terdeteksi (${dupItems.length}) — Dilewati Otomatis</span>
          </div>
        </td>
      `;
      dom.importPreviewTableBody.appendChild(trHeaderDup);
      dupItems.forEach((item, idx) => renderItemRow(item, idx + 1));
    }

    dom.importPreviewModal.style.display = 'flex';
    setupLucideIcons();
  }

  function updateConfirmImportButton() {
    if (isImporting) return;
    const selectedNewCount = pendingImportItems.filter(i => i.selected && !i.isDuplicate).length;
    dom.btnConfirmImport.disabled = selectedNewCount === 0;
    dom.btnConfirmImport.classList.remove('btn-loading');
    dom.btnConfirmImport.innerHTML = `<i data-lucide="user-plus"></i> <span id="btnConfirmImportText">${
      selectedNewCount > 0
        ? `${t('import.confirm')} (${selectedNewCount})`
        : t('import.cancel')
    }</span>`;
    dom.btnConfirmImportText = document.getElementById('btnConfirmImportText');
    setupLucideIcons();
  }

  function closeImportPreviewModal() {
    if (!dom.importPreviewModal) return;
    isImporting = false;
    if (dom.btnCancelImport) dom.btnCancelImport.disabled = false;
    if (dom.btnCloseImportModal) dom.btnCloseImportModal.disabled = false;
    if (dom.btnConfirmImport) {
      dom.btnConfirmImport.classList.remove('btn-loading');
      dom.btnConfirmImport.disabled = false;
      dom.btnConfirmImport.innerHTML = `<i data-lucide="user-plus"></i> <span id="btnConfirmImportText">${t('import.confirm')}</span>`;
      dom.btnConfirmImportText = document.getElementById('btnConfirmImportText');
      setupLucideIcons();
    }
    closeModalWithAnimation(dom.importPreviewModal, () => {
      pendingImportItems = [];
      if (dom.fileInput) dom.fileInput.value = '';
    });
  }

  async function confirmAndAppendNewGuests() {
    if (isImporting) return;

    const itemsToAdd = pendingImportItems.filter(i => i.selected && !i.isDuplicate);
    if (itemsToAdd.length === 0) {
      showToast('Tidak ada tamu baru yang dipilih untuk ditambahkan.', 'danger');
      closeImportPreviewModal();
      return;
    }

    // Set loading state immediately & disable button to prevent double clicks
    isImporting = true;
    if (dom.btnConfirmImport) {
      dom.btnConfirmImport.disabled = true;
      dom.btnConfirmImport.classList.add('btn-loading');
      dom.btnConfirmImport.innerHTML = `<span class="btn-spinner"></span> <span>${t('import.importing')}</span>`;
    }
    if (dom.btnCancelImport) dom.btnCancelImport.disabled = true;
    if (dom.btnCloseImportModal) dom.btnCloseImportModal.disabled = true;

    try {
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

      const importedGuestList = itemsToAdd.map(i => ({
        name: i.name,
        pax: i.pax,
        side: i.side
      }));

      logActivity({
        action: 'GUESTS_IMPORTED',
        summary: `Menambahkan ${newRows.length} tamu baru dari file Excel`,
        details: {
          count: newRows.length,
          fileName: pendingImportFilename,
          guestList: importedGuestList
        }
      });

      closeImportPreviewModal();

      // Re-render UI
      updateFileStatusBar(pendingImportFilename, state.rawRows.length);
      populatePreviewGuestDropdown();
      renderTable();
      updateStatsAndProgress();
      updateLivePreview();

      showToast(t('toast.importSuccess', { count: newRows.length, dup: dupCount }), 'success');
    } catch (err) {
      console.error('Import error:', err);
      showToast('Gagal mengimpor data tamu. Silakan coba lagi.', 'danger');
      isImporting = false;
      if (dom.btnCancelImport) dom.btnCancelImport.disabled = false;
      if (dom.btnCloseImportModal) dom.btnCloseImportModal.disabled = false;
      updateConfirmImportButton();
    } finally {
      isImporting = false;
    }
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
    dom.loadedFileDetails.textContent = t('fileStatus.detected', { count });
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
    showToast(t('toast.tagInserted', { tag: tagText }), 'success');
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
    const cleanMsg = (msg || '').replace(/\r\n/g, '\n');
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(cleanMsg)}`;
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

  function isNoteRedundantWithSide(note, side) {
    if (!note) return true;
    const n = note.trim().toLowerCase();
    const s = (side || '').trim().toLowerCase();
    if (n === '-' || n === '--') return true;
    if (n === s) return true;
    if (/^(dhifa|riefky|kiki|abi|umi|papa|mama)$/i.test(n)) return true;
    return false;
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
    if (!dom.templateInput || !dom.charCounter) return;
    const text = dom.templateInput.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    dom.charCounter.textContent = t('template.charsWords', { chars: text.length, words });
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
      if (dom.showingCountText) dom.showingCountText.textContent = t('table.showingCount', { count: 0, total: 0 });
      return;
    }
    const filtered = filterRows();
    if (filtered.length === 0) {
      dom.emptyState.style.display = 'block';
      dom.showingCountText.textContent = t('table.emptyTitle');
      return;
    }
    dom.emptyState.style.display = 'none';
    dom.showingCountText.textContent = t('table.showingCount', { count: filtered.length, total: state.rawRows.length });

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
        ? `<i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> ${t('card.statusSent')}`
        : `<i data-lucide="clock" style="width:14px;height:14px;"></i> ${t('card.statusPending')}`;
      btnStatus.title = isSent ? t('card.toggleToPending') : t('card.toggleToSent');
      btnStatus.addEventListener('click', async () => {
        const next = !isRowSent(row, originalIndex);
        await setRowSent(row, originalIndex, next);
        renderTable();
        showToast(next ? t('toast.markedSentName', { name: guestName }) : t('toast.markedPendingName', { name: guestName }), 'success');
      });
      tdStatus.appendChild(btnStatus);

      // Desktop RSVP Status Cell with Interactive Micro-Menu
      const currentRsvp = getRowRsvp(row, originalIndex);
      const rsvpConfig = getRsvpConfig(currentRsvp);

      const tdRsvp = document.createElement('td');
      tdRsvp.className = 'col-rsvp';
      const rsvpWrapper = document.createElement('div');
      rsvpWrapper.className = 'rsvp-cell-wrapper';

      const btnRsvp = document.createElement('button');
      btnRsvp.type = 'button';
      btnRsvp.className = `status-rsvp-btn ${rsvpConfig.class}`;
      btnRsvp.innerHTML = `<span>${rsvpConfig.emoji} ${t(rsvpConfig.labelKey)}</span> <i data-lucide="chevron-down" class="rsvp-arrow-icon" style="width:11px;height:11px;"></i>`;
      btnRsvp.title = 'Click to change RSVP status';

      const microMenu = document.createElement('div');
      microMenu.className = 'rsvp-micro-menu';
      microMenu.style.display = 'none';

      ['attending', 'declined', 'maybe', 'pending'].forEach(st => {
        const itemCfg = getRsvpConfig(st);
        const itemBtn = document.createElement('button');
        itemBtn.type = 'button';
        itemBtn.className = `rsvp-menu-item ${st === currentRsvp ? 'active' : ''}`;
        itemBtn.innerHTML = `<span>${itemCfg.emoji}</span> <span>${t(itemCfg.labelKey)}</span>`;
        itemBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          microMenu.style.display = 'none';
          rsvpWrapper.classList.remove('is-open');
          await setRowRsvp(row, originalIndex, st);
          showToast(t('toast.rsvpUpdated', { name: guestName, status: t(itemCfg.labelKey) }), 'success');
        });
        microMenu.appendChild(itemBtn);
      });

      btnRsvp.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.rsvp-micro-menu').forEach(m => {
          if (m !== microMenu) {
            m.style.display = 'none';
            m.parentElement?.classList.remove('is-open');
          }
        });
        const isOpen = microMenu.style.display !== 'none';
        microMenu.style.display = isOpen ? 'none' : 'flex';
        rsvpWrapper.classList.toggle('is-open', !isOpen);
      });

      rsvpWrapper.appendChild(btnRsvp);
      rsvpWrapper.appendChild(microMenu);
      tdRsvp.appendChild(rsvpWrapper);

      const side = getGuestSide(row);
      const note = getGuestNote(row);

      const tdName = document.createElement('td');
      tdName.className = 'col-name';
      let chips = '';
      chips += `<span class="meta-chip meta-chip-blue">👥 ${formatPaxText(pax)}</span>`;
      const sideBadge = getSideBadgeHtml(side);
      if (sideBadge) chips += sideBadge;
      if (label && label !== '-' && label !== '--') chips += `<span class="meta-chip">${escapeHtml(label)}</span>`;
      tdName.innerHTML = `<div class="guest-name-cell"><div class="guest-name-text">${escapeHtml(guestName)}</div><div class="guest-meta-tags">${chips}</div></div>`;

      const tdPhone = document.createElement('td');
      tdPhone.className = 'col-phone phone-cell-text';
      tdPhone.innerHTML = phoneInfo.isValid
        ? `<span class="phone-valid"><i data-lucide="check" style="width:14px;height:14px;"></i> +${escapeHtml(phoneInfo.formatted)}</span>`
        : `<span class="phone-empty"><i data-lucide="phone-off" style="width:12px;height:12px;"></i> ${t('card.withoutPhone')}</span>`;

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
      btnSend.innerHTML = `<i data-lucide="send" style="width:13px;height:13px;"></i> ${t('card.sendWa')}`;
      if (!phoneInfo.isValid) {
        btnSend.classList.add('btn-action-disabled');
      } else {
        btnSend.addEventListener('click', async () => {
          window.open(waUrl, '_blank');
          await setRowSent(row, originalIndex, true);
          renderTable();
          showToast(t('toast.openingWa', { name: guestName }), 'success');
        });
      }

      const btnCopyLink = document.createElement('button');
      btnCopyLink.type = 'button';
      btnCopyLink.className = 'btn-icon-action btn-copy-link';
      btnCopyLink.innerHTML = `<i data-lucide="link" style="width:13px;height:13px;"></i>`;
      btnCopyLink.title = t('card.copyLink');
      if (!phoneInfo.isValid) {
        btnCopyLink.classList.add('btn-action-disabled');
      } else {
        btnCopyLink.addEventListener('click', () => copyToClipboard(waUrl, t('toast.linkCopied', { name: guestName })));
      }

      const btnCopyMsg = document.createElement('button');
      btnCopyMsg.type = 'button';
      btnCopyMsg.className = 'btn-icon-action btn-copy-msg';
      btnCopyMsg.innerHTML = `<i data-lucide="copy" style="width:13px;height:13px;"></i>`;
      btnCopyMsg.title = t('card.copyMsg');
      btnCopyMsg.addEventListener('click', () => copyToClipboard(compiledMsg, t('toast.msgCopied', { name: guestName })));

      const btnView = document.createElement('button');
      btnView.type = 'button';
      btnView.className = 'btn-icon-action btn-view-preview';
      btnView.innerHTML = `<i data-lucide="eye" style="width:13px;height:13px;"></i>`;
      btnView.title = t('card.viewDetail');
      btnView.addEventListener('click', () => openPreviewModal(row, originalIndex, compiledMsg, waUrl, phoneInfo));

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-icon-action btn-action-delete btn-delete-row';
      btnDelete.innerHTML = `<i data-lucide="trash-2" style="width:13px;height:13px;"></i>`;
      btnDelete.title = t('card.deleteGuestTitle', { name: guestName });
      btnDelete.addEventListener('click', () => confirmDeleteGuest(originalIndex));

      actionsWrapper.appendChild(btnSend);
      actionsWrapper.appendChild(btnCopyLink);
      actionsWrapper.appendChild(btnCopyMsg);
      actionsWrapper.appendChild(btnView);
      actionsWrapper.appendChild(btnDelete);
      tdActions.appendChild(actionsWrapper);

      tr.appendChild(tdNo);
      tr.appendChild(tdStatus);
      tr.appendChild(tdRsvp);
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
            <button type="button" class="mobile-status-btn ${isSent ? 'status-sent' : 'status-pending'}" title="${isSent ? t('card.toggleToPending') : t('card.toggleToSent')}" aria-label="${isSent ? t('card.statusSent') : t('card.statusPending')}">
              <i data-lucide="${isSent ? 'check' : 'clock'}" style="width:18px;height:18px;"></i>
            </button>
            <div class="mobile-guest-header-main flex-1 min-w-0">
              <div class="mobile-guest-title-row flex items-center gap-2 min-w-0 w-full">
                <span class="mobile-guest-num text-xs font-bold">#${originalIndex + 1}</span>
                <span class="mobile-guest-name font-semibold truncate whitespace-nowrap">${escapeHtml(guestName)}</span>
              </div>
              <div class="mobile-guest-sub-row flex flex-wrap items-center gap-1.5 text-xs mt-1">
                <span class="mobile-pax-badge text-xs"><i data-lucide="users" style="width:11px;height:11px;"></i> ${formatPaxText(pax)}</span>
                <span class="mobile-rsvp-badge ${rsvpConfig.class}">${rsvpConfig.emoji} ${t(rsvpConfig.labelKey)}</span>
                ${side === 'dhifa' ? `<span class="mobile-side-badge side-dhifa text-xs">🌸 Dhifa</span>` : (side === 'riefky' ? `<span class="mobile-side-badge side-riefky text-xs">💼 Riefky</span>` : '')}
                ${label ? `<span class="mobile-category-badge text-xs">${escapeHtml(label)}</span>` : ''}
              </div>
            </div>
            <div class="mobile-guest-header-actions pointer-events-none flex items-center justify-center shrink-0">
              <span class="mobile-chevron-wrap pointer-events-none">
                <i data-lucide="chevron-down" class="mobile-chevron-icon" style="width:16px;height:16px;"></i>
              </span>
            </div>
          </div>

          <div class="mobile-guest-drawer">
            <div class="mobile-drawer-inner">
              <div class="mobile-drawer-meta">
                ${side ? `<div class="mobile-meta-item"><strong>${t('card.metaSide')}:</strong> ${getSideBadgeHtml(side)}</div>` : ''}
                ${label ? `<div class="mobile-meta-item"><strong>${t('card.metaCategory')}:</strong> ${escapeHtml(label)}</div>` : ''}
                ${(note && !isNoteRedundantWithSide(note, side)) ? `<div class="mobile-meta-item"><strong>${t('card.metaNote')}:</strong> ${escapeHtml(note)}</div>` : ''}
                <div class="mobile-meta-item">
                  <strong>${t('card.metaPhone')}:</strong> ${phoneInfo.isValid ? '+' + escapeHtml(phoneInfo.formatted) : '<em style="color:#94a3b8">' + t('card.withoutPhone') + '</em>'}
                </div>
                ${(link && link.startsWith('http')) ? `
                  <div class="mobile-meta-item">
                    <strong>${t('card.metaInvitation')}:</strong> <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="mobile-meta-link">${escapeHtml(link)}</a>
                  </div>
                ` : ''}
              </div>

              <!-- Mobile Drawer RSVP Segmented Control -->
              <div class="mobile-rsvp-section">
                <div class="mobile-rsvp-label"><i data-lucide="calendar-check" style="width:13px;height:13px;"></i> <span>${t('table.thRsvp')}</span></div>
                <div class="mobile-rsvp-segmented">
                  <button type="button" class="mobile-rsvp-seg-btn rsvp-attending ${currentRsvp === 'attending' ? 'active' : ''}" data-rsvp="attending">🟢 ${t('rsvp.attending')}</button>
                  <button type="button" class="mobile-rsvp-seg-btn rsvp-declined ${currentRsvp === 'declined' ? 'active' : ''}" data-rsvp="declined">🔴 ${t('rsvp.declined')}</button>
                  <button type="button" class="mobile-rsvp-seg-btn rsvp-maybe ${currentRsvp === 'maybe' ? 'active' : ''}" data-rsvp="maybe">🟡 ${t('rsvp.maybe')}</button>
                  <button type="button" class="mobile-rsvp-seg-btn rsvp-pending ${currentRsvp === 'pending' ? 'active' : ''}" data-rsvp="pending">⚪ ${t('rsvp.pending')}</button>
                </div>
              </div>

              <div class="mobile-drawer-actions">
                <button type="button" class="btn btn-primary btn-drawer-send ${!phoneInfo.isValid ? 'btn-action-disabled' : ''} w-full min-h-[44px]">
                  <i data-lucide="send"></i> ${t('card.sendWa')}
                </button>
                <button type="button" class="btn btn-outline btn-drawer-copy-link ${(!phoneInfo.isValid && !link) ? 'btn-action-disabled' : ''} w-full min-h-[44px]">
                  <i data-lucide="link"></i> ${t('card.copyLink')}
                </button>
                <button type="button" class="btn btn-outline btn-drawer-toggle-sent w-full min-h-[44px]">
                  <i data-lucide="${isSent ? 'rotate-ccw' : 'check'}"></i> ${isSent ? t('card.markAsPending') : t('card.markAsSent')}
                </button>
                <div class="mobile-drawer-actions-secondary">
                  <button type="button" class="btn btn-outline btn-drawer-preview min-h-[44px]">
                    <i data-lucide="eye"></i> ${t('card.preview')}
                  </button>
                  <button type="button" class="btn btn-outline btn-drawer-copy-msg min-h-[44px]">
                    <i data-lucide="copy"></i> ${t('card.copyMsg')}
                  </button>
                  <button type="button" class="btn btn-outline-danger btn-drawer-delete min-h-[44px]">
                    <i data-lucide="trash-2"></i> ${t('card.deleteGuest')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Click anywhere on row header to expand/collapse (smooth accordion with viewport anchor)
        const rowHeader = card.querySelector('.mobile-guest-row-header');
        rowHeader.addEventListener('click', (e) => {
          if (e.target.closest('.mobile-status-btn')) return;
          toggleMobileCard(card, originalIndex);
        });

        rowHeader.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.closest('.mobile-status-btn')) return;
            e.preventDefault();
            toggleMobileCard(card, originalIndex);
          }
        });

        // Quick status toggle directly on status icon or drawer button, with Undo toast
        const handleStatusToggle = async (e) => {
          if (e) e.stopPropagation();
          const previousState = isRowSent(row, originalIndex);
          const nextState = !previousState;
          await setRowSent(row, originalIndex, nextState);
          renderTable();
          showToast(
            nextState ? t('toast.markedSentName', { name: guestName }) : t('toast.markedPendingName', { name: guestName }),
            'success',
            {
              label: t('toast.undo'),
              onClick: async () => {
                await setRowSent(row, originalIndex, previousState);
                renderTable();
                showToast(t('toast.statusReverted', { name: guestName }), 'info');
              }
            }
          );
        };

        const statusBtn = card.querySelector('.mobile-status-btn');
        if (statusBtn) {
          statusBtn.addEventListener('click', handleStatusToggle);
        }

        const btnToggleSent = card.querySelector('.btn-drawer-toggle-sent');
        if (btnToggleSent) {
          btnToggleSent.addEventListener('click', handleStatusToggle);
        }

        // Mobile Drawer RSVP Segmented Buttons
        card.querySelectorAll('.mobile-rsvp-seg-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const st = btn.dataset.rsvp;
            await setRowRsvp(row, originalIndex, st);
            const itemCfg = getRsvpConfig(st);
            showToast(t('toast.rsvpUpdated', { name: guestName, status: t(itemCfg.labelKey) }), 'success');
          });
        });

        // Drawer buttons
        const btnPrev = card.querySelector('.btn-drawer-preview');
        if (btnPrev) {
          btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            openPreviewModal(row, originalIndex, compiledMsg, waUrl, phoneInfo);
          });
        }

        const btnCopyLinkMobile = card.querySelector('.btn-drawer-copy-link');
        if (btnCopyLinkMobile) {
          const targetLink = phoneInfo.isValid ? waUrl : (link || '');
          if (targetLink) {
            btnCopyLinkMobile.addEventListener('click', (e) => {
              e.stopPropagation();
              copyToClipboard(targetLink, t('toast.linkCopied', { name: guestName }));
            });
          } else {
            btnCopyLinkMobile.addEventListener('click', (e) => {
              e.stopPropagation();
              showToast(t('toast.noLinkToCopy'), 'danger');
            });
          }
        }

        const btnCopyMsgMobile = card.querySelector('.btn-drawer-copy-msg');
        if (btnCopyMsgMobile) {
          btnCopyMsgMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(compiledMsg, t('toast.msgCopied', { name: guestName }));
          });
        }

        const btnDeleteMobile = card.querySelector('.btn-drawer-delete');
        if (btnDeleteMobile) {
          btnDeleteMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteGuest(originalIndex);
          });
        }

        const btnSend = card.querySelector('.btn-drawer-send');
        if (btnSend) {
          if (phoneInfo.isValid) {
            btnSend.addEventListener('click', async (e) => {
              e.stopPropagation();
              window.open(waUrl, '_blank');
              await setRowSent(row, originalIndex, true);
              renderTable();
              showToast(t('toast.openingWa', { name: guestName }), 'success');
            });
          } else {
            btnSend.addEventListener('click', (e) => {
              e.stopPropagation();
              showToast(t('toast.invalidPhone'), 'danger');
            });
          }
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
    const rsvpFilter = state.currentRsvpFilter || 'all';

    return state.rawRows.map((row, originalIndex) => ({ row, originalIndex })).filter(({ row, originalIndex }) => {
      const phoneInfo = normalizePhone(row[state.phoneColumn]);
      const isSent = isRowSent(row, originalIndex);
      const rsvp = getRowRsvp(row, originalIndex);
      const name = (row['Nama'] || row['Name'] || '').toString().toLowerCase();
      const label = (row['Label'] || '').toString().toLowerCase();
      const phone = (row[state.phoneColumn] || '').toString().toLowerCase();
      const note = getGuestNote(row).toLowerCase();
      const guestSide = getGuestSide(row);

      // 1. Pihak / Notes filter (Dhifa, Riefky, Abi, Umi, Papa, Mama)
      if (sideFilter !== 'all' && guestSide !== sideFilter) return false;

      // 2. Delivery Status filter
      if (filter === 'pending' && isSent) return false;
      if (filter === 'sent' && !isSent) return false;

      // 3. RSVP Attendance filter
      if (rsvpFilter !== 'all' && rsvp !== rsvpFilter) return false;

      // 4. Search query
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
      dom.statTotalPax.textContent = `👥 ${formatPaxText(totalPax)}`;
    }

    dom.statSentCount.textContent = `${sentCount} (${percentage}%)`;
    if (dom.statSentPax) {
      dom.statSentPax.classList.remove('has-skeleton');
      dom.statSentPax.textContent = `👥 ${formatPaxText(sentPax)}`;
    }

    dom.statPendingCount.textContent = pendingCount;
    if (dom.statPendingPax) {
      dom.statPendingPax.classList.remove('has-skeleton');
      dom.statPendingPax.textContent = `👥 ${formatPaxText(pendingPax)}`;
    }

    if (dom.statWithPhone) dom.statWithPhone.textContent = withPhone;
    if (dom.statWithPhonePax) dom.statWithPhonePax.textContent = `👥 ${formatPaxText(withPhonePax)}`;

    dom.progressPercentage.textContent = `${percentage}% (${sentCount}/${total} · ${sentPax}/${totalPax} ${totalPax === 1 ? t('stat.guestSingular') : t('stat.progressGuests')})`;
    dom.progressBarFill.style.width = `${percentage}%`;

    // Status filter counters — based on side+search only (NOT the active status pill)
    // so All=Sent+NotSent always holds and switching pills doesn't zero-out the other tab
    const countAllEl = document.getElementById('countFilterAll');
    const countPendingEl = document.getElementById('countFilterPending');
    const countSentEl = document.getElementById('countFilterSent');
    const q = state.searchQuery.toLowerCase().trim();
    const sideFilter = state.currentSideFilter || 'all';
    const sideSearchFiltered = state.rawRows.map((row, originalIndex) => ({ row, originalIndex })).filter(({ row, originalIndex }) => {
      const guestSide = getGuestSide(row);
      if (sideFilter !== 'all' && guestSide !== sideFilter) return false;
      if (q) {
        const name = (row['Nama'] || row['Name'] || '').toString().toLowerCase();
        const label = (row['Label'] || '').toString().toLowerCase();
        const phone = (row[state.phoneColumn] || '').toString().toLowerCase();
        const note = getGuestNote(row).toLowerCase();
        return name.includes(q) || label.includes(q) || phone.includes(q) || note.includes(q);
      }
      return true;
    });
    const tabSentCount = sideSearchFiltered.filter(({ row, originalIndex }) => isRowSent(row, originalIndex)).length;
    const tabPendingCount = sideSearchFiltered.length - tabSentCount;
    if (countAllEl) countAllEl.textContent = sideSearchFiltered.length;
    if (countPendingEl) countPendingEl.textContent = tabPendingCount;
    if (countSentEl) countSentEl.textContent = tabSentCount;

    // RSVP Attendance counters — dynamically scoped to active side filter + search query
    let rsvpAttending = 0, rsvpAttendingPax = 0;
    let rsvpDeclined = 0;
    let rsvpMaybe = 0;
    let rsvpPending = 0;

    sideSearchFiltered.forEach(({ row, originalIndex }) => {
      const rsvp = getRowRsvp(row, originalIndex);
      const pax = parseInt(row['Jumlah Tamu'] || row['Pax'] || row['pax'] || 1, 10) || 1;
      if (rsvp === 'attending') {
        rsvpAttending++;
        rsvpAttendingPax += pax;
      } else if (rsvp === 'declined') {
        rsvpDeclined++;
      } else if (rsvp === 'maybe') {
        rsvpMaybe++;
      } else {
        rsvpPending++;
      }
    });

    // RSVP Attendance Summary Bar (Single Compact Strip, responsive text on desktop)
    if (dom.rsvpSummaryAttending) {
      dom.rsvpSummaryAttending.innerHTML = `<span class="rsvp-emoji">🟢</span> ${rsvpAttending} <span class="rsvp-text-label">${t('rsvp.attending')}</span> (${rsvpAttendingPax} Pax)`;
    }
    if (dom.rsvpSummaryDeclined) {
      dom.rsvpSummaryDeclined.innerHTML = `<span class="rsvp-emoji">🔴</span> ${rsvpDeclined} <span class="rsvp-text-label">${t('rsvp.declined')}</span>`;
    }
    if (dom.rsvpSummaryMaybe) {
      dom.rsvpSummaryMaybe.innerHTML = `<span class="rsvp-emoji">🟡</span> ${rsvpMaybe} <span class="rsvp-text-label">${t('rsvp.maybe')}</span>`;
    }
    if (dom.rsvpSummaryPending) {
      dom.rsvpSummaryPending.innerHTML = `<span class="rsvp-emoji">⚪</span> ${rsvpPending} <span class="rsvp-text-label">${t('rsvp.pending')}</span>`;
    }

    // Pihak / Notes filter counters (global totals per side)
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

    // RSVP Filter Dropdown counters (dynamically scoped to sideSearchFiltered)
    const countRsvpAllEl = document.getElementById('countRsvpAll');
    const countRsvpAttendingEl = document.getElementById('countRsvpAttending');
    const countRsvpDeclinedEl = document.getElementById('countRsvpDeclined');
    const countRsvpMaybeEl = document.getElementById('countRsvpMaybe');
    const countRsvpPendingEl = document.getElementById('countRsvpPending');
    if (countRsvpAllEl) countRsvpAllEl.textContent = sideSearchFiltered.length;
    if (countRsvpAttendingEl) countRsvpAttendingEl.textContent = rsvpAttending;
    if (countRsvpDeclinedEl) countRsvpDeclinedEl.textContent = rsvpDeclined;
    if (countRsvpMaybeEl) countRsvpMaybeEl.textContent = rsvpMaybe;
    if (countRsvpPendingEl) countRsvpPendingEl.textContent = rsvpPending;
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
    const link = (row['Link'] || row['link'] || row['Link Undangan'] || '').trim();

    dom.modalGuestTitle.textContent = `${t('modal.sendTitle')}: ${name}`;

    let modalMetaHtml = `<span class="meta-chip">#${index + 1}</span>`;
    modalMetaHtml += `<span class="meta-chip meta-chip-blue">👥 ${formatPaxText(pax)}</span>`;
    const sideBadge = getSideBadgeHtml(side);
    if (sideBadge) modalMetaHtml += sideBadge;
    if (label && label !== '-' && label !== '--') modalMetaHtml += `<span class="meta-chip">${escapeHtml(label)}</span>`;
    if (note && !isNoteRedundantWithSide(note, side)) modalMetaHtml += `<span class="meta-chip meta-chip-note">📝 ${escapeHtml(note)}</span>`;
    modalMetaHtml += `<span class="meta-chip ${phoneInfo.isValid ? 'meta-chip-blue' : ''}">${phoneInfo.isValid ? 'WA: +' + phoneInfo.formatted : t('card.withoutPhone')}</span>`;
    modalMetaHtml += `<span class="meta-chip" style="background:${isSent ? '#DCFCE7' : '#F1F5F9'};color:${isSent ? '#166534' : '#475569'};font-weight:700;">${isSent ? t('card.statusSent') : t('card.statusPending')}</span>`;

    dom.modalGuestInfo.innerHTML = modalMetaHtml;

    const formattedHtml = parseWhatsAppFormatting(compiledMsg);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    dom.modalMessageContent.innerHTML = `<div class="wa-msg-text">${formattedHtml}</div><div class="wa-meta-time"><span>${timeStr}</span><span class="wa-ticks">✓✓</span></div>`;

    // Dynamic copy URL: prefer WhatsApp link if phone exists, else web invitation link
    const copyUrl = (phoneInfo.isValid && waUrl) ? waUrl : link;
    const labelEl = dom.modalWaLinkInput?.closest('.modal-input-group')?.querySelector('label');
    if (labelEl) {
      labelEl.textContent = (phoneInfo.isValid && waUrl) ? t('modal.waLink') : t('modal.invitationLink');
    }

    dom.modalWaLinkInput.value = copyUrl || t('modal.noPhone');
    dom.btnModalCopyLink.disabled = !copyUrl;
    dom.btnModalCopyLink.onclick = () => {
      if (!copyUrl) return;
      copyToClipboard(copyUrl, t('toast.linkCopiedSimple'));
    };

    dom.btnModalCopyText.onclick = () => copyToClipboard(compiledMsg, t('toast.msgCopiedSimple'));

    if (!phoneInfo.isValid) {
      dom.btnModalSendWa.disabled = true;
      dom.btnModalSendWa.innerHTML = `<i data-lucide="phone-off"></i> ${t('modal.noPhone')}`;
    } else {
      dom.btnModalSendWa.disabled = false;
      dom.btnModalSendWa.innerHTML = `<i data-lucide="send"></i> ${t('modal.openWa')}`;
    }

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
        showToast(t('toast.openingWa', { name }), 'success');
      }
    };
    dom.previewModal.style.display = 'flex';
    setupLucideIcons();
  }

  function closeModal() {
    if (!dom.previewModal) return;
    closeModalWithAnimation(dom.previewModal);
  }

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
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, 99999);
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showToast(successMsg, 'success');
      } else {
        showToast('Gagal menyalin teks.', 'danger');
      }
    } catch {
      showToast('Gagal menyalin teks.', 'danger');
    }
    document.body.removeChild(ta);
  }

  function showToast(message, type = 'success', action = null) {
    const toast = document.createElement('div');
    const isDanger = type === 'danger';
    const isInfo = type === 'info';
    toast.className = `toast ${isDanger ? 'toast-danger' : (isInfo ? 'toast-info' : '')}`;
    const icon = isDanger ? 'alert-triangle' : (isInfo ? 'info' : 'check-circle-2');

    let contentHtml = `<div class="toast-content"><i data-lucide="${icon}" style="width:16px;height:16px;flex-shrink:0;"></i> <span>${escapeHtml(message)}</span></div>`;
    if (action && action.label) {
      contentHtml += `<button type="button" class="toast-action-btn">${escapeHtml(action.label)}</button>`;
    }
    toast.innerHTML = contentHtml;

    if (action && typeof action.onClick === 'function') {
      const btnAction = toast.querySelector('.toast-action-btn');
      if (btnAction) {
        btnAction.addEventListener('click', (e) => {
          e.stopPropagation();
          action.onClick();
          toast.classList.add('toast-closing');
          setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 220);
        });
      }
    }

    dom.toastContainer.appendChild(toast);
    setupLucideIcons();
    const duration = action ? 4500 : 3200;
    setTimeout(() => {
      toast.classList.add('toast-closing');
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 220);
    }, duration);
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
      case 'RSVP_STATUS_UPDATED':
        return { icon: 'calendar-check', class: 'activity-icon-status-sent' };
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

      const guestList = (log.details && Array.isArray(log.details.guestList)) ? log.details.guestList : [];
      const hasGuestList = guestList.length > 0;

      const item = document.createElement('div');
      item.className = `activity-log-item ${hasGuestList ? 'has-dropdown' : ''}`;

      let guestDropdownHtml = '';
      let toggleBtnHtml = '';

      if (hasGuestList) {
        toggleBtnHtml = `
          <button type="button" class="btn-activity-guest-toggle" title="Klik untuk melihat daftar nama tamu yang diimpor">
            <i data-lucide="users" style="width:12px;height:12px;"></i>
            <span class="toggle-text">Lihat ${guestList.length} Tamu</span>
            <i data-lucide="chevron-down" class="activity-chevron-icon"></i>
          </button>
        `;

        guestDropdownHtml = `
          <div class="activity-guest-dropdown" style="display: none;">
            <div class="activity-guest-dropdown-header">
              <span>Daftar ${guestList.length} Tamu yang Diimpor:</span>
            </div>
            <div class="activity-guest-dropdown-list">
              ${guestList.map((g, gIdx) => `
                <div class="activity-guest-row">
                  <span class="activity-guest-index">#${gIdx + 1}</span>
                  <span class="activity-guest-name" title="${escapeHtml(g.name || 'Tamu')}">${escapeHtml(g.name || 'Tamu')}</span>
                  <span class="activity-guest-pax">👥 ${g.pax || 1} Pax</span>
                  ${getSideBadgeHtml(g.side) || ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      item.innerHTML = `
        <div class="activity-item-main">
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
            ${toggleBtnHtml}
          </div>
        </div>
        ${guestDropdownHtml}
      `;

      if (hasGuestList) {
        const toggleBtn = item.querySelector('.btn-activity-guest-toggle');
        const dropdown = item.querySelector('.activity-guest-dropdown');
        const toggleText = item.querySelector('.toggle-text');

        const toggleDropdown = (e) => {
          if (e) e.stopPropagation();
          const isCurrentlyOpen = dropdown.style.display !== 'none';
          dropdown.style.display = isCurrentlyOpen ? 'none' : 'block';
          item.classList.toggle('is-expanded', !isCurrentlyOpen);
          if (toggleText) {
            toggleText.textContent = isCurrentlyOpen ? `Lihat ${guestList.length} Tamu` : `Tutup (${guestList.length} Tamu)`;
          }
        };

        if (toggleBtn) {
          toggleBtn.addEventListener('click', toggleDropdown);
        }
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.activity-guest-dropdown')) {
            toggleDropdown(e);
          }
        });
      }

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
    closeModalWithAnimation(dom.activityLogModal);
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

    let debounceRenderTableTimer = null;
    function debouncedRenderTable(delay = 250) {
      if (debounceRenderTableTimer) clearTimeout(debounceRenderTableTimer);
      debounceRenderTableTimer = setTimeout(() => {
        renderTable();
        updateStatsAndProgress();
      }, delay);
    }

    dom.templateInput.addEventListener('input', (e) => {
      state.currentTemplate = e.target.value;
      updateCharCounter();
      updateLivePreview();
      debouncedRenderTable(250);
    });

    dom.btnSaveCustomTemplate.addEventListener('click', async () => {
      await saveCustomTemplate(dom.templateInput.value);
      dom.templatePresetSelect.value = 'custom';
      showToast(t('toast.templateSaved'), 'success');
      logActivity({
        action: 'TEMPLATE_UPDATED',
        summary: 'Menyimpan perubahan template pesan WhatsApp',
        details: {}
      });
    });

    dom.btnResetTemplate.addEventListener('click', () => {
      showCustomConfirm({
        title: t('confirm.resetTemplateTitle'),
        message: t('confirm.resetTemplateDesc'),
        icon: 'rotate-ccw',
        theme: 'danger',
        confirmText: t('confirm.resetTemplateBtn'),
        cancelText: t('confirm.cancelBtn'),
        onConfirm: () => {
          state.currentTemplate = PRESET_TEMPLATES.formal;
          dom.templatePresetSelect.value = 'formal';
          dom.templateInput.value = state.currentTemplate;
          updateCharCounter();
          updateLivePreview();
          renderTable();
          showToast(t('toast.templateReset'), 'success');
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
      debouncedRenderTable(150);
    });

    dom.btnClearSearch.addEventListener('click', () => {
      dom.searchInput.value = '';
      state.searchQuery = '';
      dom.btnClearSearch.style.display = 'none';
      renderTable();
      updateStatsAndProgress();
    });

    dom.filterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      dom.filterPills.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      renderTable();
      updateStatsAndProgress();
    });

    dom.btnMarkAllSent.addEventListener('click', () => {
      const filtered = filterRows();
      if (filtered.length === 0) {
        showToast(t('table.emptyTitle'), 'danger');
        return;
      }
      showCustomConfirm({
        title: t('confirm.markAllSentTitle'),
        message: t('confirm.markAllSentDesc', { count: filtered.length }),
        icon: 'check-circle-2',
        theme: 'info',
        confirmText: t('confirm.markAllSentBtn'),
        cancelText: t('confirm.cancelBtn'),
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
            summary: `Marked ${filtered.length} guests as Sent`,
            details: { count: filtered.length }
          });
          showToast(t('toast.allMarkedSent'), 'success');
        }
      });
    });

    dom.btnResetAllSent.addEventListener('click', () => {
      showCustomConfirm({
        title: t('confirm.resetAllSentTitle'),
        message: t('confirm.resetAllSentDesc', { count: state.rawRows.length }),
        icon: 'rotate-ccw',
        theme: 'danger',
        confirmText: t('confirm.resetAllSentBtn'),
        cancelText: t('confirm.cancelBtn'),
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
            summary: 'Reset all delivery statuses to Not Sent',
            details: {}
          });
          showToast(t('toast.allResetPending'), 'success');
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
        if (dom.rsvpFilterDropdownMenu) {
          dom.rsvpFilterDropdownMenu.style.display = 'none';
          if (dom.btnRsvpFilterDropdown) dom.btnRsvpFilterDropdown.setAttribute('aria-expanded', 'false');
        }
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
        updateStatsAndProgress();
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

    // RSVP Attendance Filter Dropdown
    if (dom.btnRsvpFilterDropdown && dom.rsvpFilterDropdownMenu) {
      dom.btnRsvpFilterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dom.sideFilterDropdownMenu) {
          dom.sideFilterDropdownMenu.style.display = 'none';
          if (dom.btnSideFilterDropdown) dom.btnSideFilterDropdown.setAttribute('aria-expanded', 'false');
        }
        const isHidden = dom.rsvpFilterDropdownMenu.style.display === 'none';
        dom.rsvpFilterDropdownMenu.style.display = isHidden ? 'flex' : 'none';
        dom.btnRsvpFilterDropdown.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });

      dom.rsvpFilterDropdownMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.filter-dropdown-option');
        if (!option) return;
        const selectedRsvp = option.dataset.rsvp || 'all';
        state.currentRsvpFilter = selectedRsvp;

        dom.rsvpFilterDropdownMenu.querySelectorAll('.filter-dropdown-option').forEach(opt => {
          opt.classList.toggle('active', opt === option);
        });

        updateRsvpFilterLabels();

        if (dom.btnRsvpFilterDropdown) {
          dom.btnRsvpFilterDropdown.classList.toggle('has-filter', selectedRsvp !== 'all');
        }

        dom.rsvpFilterDropdownMenu.style.display = 'none';
        dom.btnRsvpFilterDropdown.setAttribute('aria-expanded', 'false');
        renderTable();
        updateStatsAndProgress();
      });

      document.addEventListener('click', (e) => {
        if (dom.rsvpDropdownContainer && !dom.rsvpDropdownContainer.contains(e.target)) {
          dom.rsvpFilterDropdownMenu.style.display = 'none';
          if (dom.btnRsvpFilterDropdown) dom.btnRsvpFilterDropdown.setAttribute('aria-expanded', 'false');
        }
        // Also close any desktop rsvp-micro-menu when clicking outside
        if (!e.target.closest('.rsvp-cell-wrapper')) {
          document.querySelectorAll('.rsvp-micro-menu').forEach(m => {
            m.style.display = 'none';
            m.parentElement?.classList.remove('is-open');
          });
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (dom.rsvpFilterDropdownMenu.style.display !== 'none') {
            dom.rsvpFilterDropdownMenu.style.display = 'none';
            if (dom.btnRsvpFilterDropdown) dom.btnRsvpFilterDropdown.setAttribute('aria-expanded', 'false');
          }
          document.querySelectorAll('.rsvp-micro-menu').forEach(m => {
            m.style.display = 'none';
            m.parentElement?.classList.remove('is-open');
          });
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

    // Load sent statuses & RSVP statuses concurrently
    await Promise.all([
      loadSentStatuses(),
      loadRsvpStatuses()
    ]);

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
    initLanguage();
    setupPinGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
