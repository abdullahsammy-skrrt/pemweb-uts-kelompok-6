// kamar.js - popup detail kamar. Data diambil dari database lewat GET /kamar/:id/detail (JSON).
(function () {
    var modal = document.getElementById('modal-kamar');
    var isi = document.getElementById('modal-isi');
    var judul = document.getElementById('modal-judul');
    if (!modal || !isi) return;

    var pembuka = null;   // tombol yang membuka popup (fokus dikembalikan ke sini saat ditutup)
    var permintaan = 0;   // penanda supaya respons lama tidak menimpa respons yang baru

    var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // ---------- helper tampilan (memakai textContent, jadi aman dari XSS) ----------
    function el(tag, kelas, teks) {
        var n = document.createElement(tag);
        if (kelas) n.className = kelas;
        if (teks !== undefined && teks !== null) n.textContent = teks;
        return n;
    }
    function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
    function tanggal(s) {               // 'YYYY-MM-DD' -> '10 Januari 2026'
        var p = String(s || '').split('-');
        return p.length === 3 ? parseInt(p[2], 10) + ' ' + BULAN[parseInt(p[1], 10) - 1] + ' ' + p[0] : '-';
    }
    function periode(s) {               // 'YYYY-MM' -> 'November 2026'
        var p = String(s || '').split('-');
        return p.length === 2 ? BULAN[parseInt(p[1], 10) - 1] + ' ' + p[0] : '-';
    }
    function baris(label, nilai) {
        var b = el('div', 'detail-baris');
        b.appendChild(el('span', 'detail-label', label));
        if (nilai instanceof Node) { b.appendChild(nilai); } else { b.appendChild(el('span', 'detail-nilai', nilai)); }
        return b;
    }
    function badge(kelas, teks) { return el('span', 'badge badge-' + kelas, teks); }
    function bagian(teks) { return el('h3', 'modal-subjudul', teks); }

    // ---------- isi popup ----------
    function tampilkan(d) {
        isi.textContent = '';
        judul.textContent = 'Detail Kamar ' + d.kamar.nomor_kamar;

        // Informasi kamar
        var info = el('div', 'detail-blok');
        info.appendChild(baris('Nomor kamar', el('span', 'plat', d.kamar.nomor_kamar)));
        info.appendChild(baris('Tipe', d.kamar.tipe || '-'));
        info.appendChild(baris('Harga / bulan', rupiah(d.kamar.harga_bulanan)));
        info.appendChild(baris('Status kamar', badge(d.kamar.status, d.kamar.status)));
        isi.appendChild(info);

        // A. Penghuni + B. Pembayaran
        isi.appendChild(bagian('Penghuni & Pembayaran'));
        if (d.penghuni.length === 0) {
            isi.appendChild(el('p', 'catatan', 'Kamar ini belum memiliki penghuni aktif.'));
        }
        d.penghuni.forEach(function (p) {
            var kartu = el('div', 'detail-blok');
            kartu.appendChild(baris('Nama penghuni', el('strong', 'detail-nilai', p.nama)));
            kartu.appendChild(baris('No. HP', p.no_hp || '-'));
            kartu.appendChild(baris('Tanggal masuk', tanggal(p.tanggal_masuk)));
            if (p.status_bayar) {
                var lunas = p.status_bayar === 'lunas';
                kartu.appendChild(baris('Status pembayaran', badge(p.status_bayar, lunas ? 'Lunas' : 'Belum Lunas')));
                kartu.appendChild(baris('Periode', periode(p.periode_bayar) + ' \u2022 ' + rupiah(p.jumlah_bayar)));
                if (lunas && p.tanggal_bayar) kartu.appendChild(baris('Dibayar pada', tanggal(p.tanggal_bayar)));
            } else {
                kartu.appendChild(baris('Status pembayaran', 'Belum ada data pembayaran'));
            }
            isi.appendChild(kartu);
        });

        // C. Fasilitas
        isi.appendChild(bagian('Fasilitas Kamar'));
        if (d.fasilitas.length === 0) {
            isi.appendChild(el('p', 'catatan', 'Belum ada fasilitas pada kamar ini.'));
        } else {
            var ul = el('ul', 'fas-list fas-list-modal');
            d.fasilitas.forEach(function (f) {
                var li = el('li');
                li.appendChild(el('span', 'fas-nama', f.nama_fasilitas));
                li.appendChild(badge(f.kondisi, f.kondisi === 'rusak' ? 'Rusak' : 'Baik'));
                if (f.kondisi === 'rusak' && f.keterangan) {
                    li.appendChild(el('span', 'fas-ket', '(' + f.keterangan + ')'));
                }
                ul.appendChild(li);
            });
            isi.appendChild(ul);
        }
    }

    function pesan(teks, error) {
        isi.textContent = '';
        isi.appendChild(el('p', error ? 'fp-error' : 'catatan', teks));
    }

    // ---------- buka / tutup ----------
    function buka(id, tombol) {
        pembuka = tombol;
        var no = ++permintaan;
        judul.textContent = 'Detail Kamar';
        pesan('Memuat data...');
        modal.hidden = false;
        document.body.classList.add('modal-terbuka');
        modal.querySelector('[data-tutup]').focus();

        fetch('/kamar/' + encodeURIComponent(id) + '/detail', { headers: { Accept: 'application/json' } })
            .then(function (r) {
                var json = (r.headers.get('content-type') || '').indexOf('application/json') !== -1;
                if (!json) throw new Error('Respons tidak valid');
                return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || 'Gagal memuat data'); return d; });
            })
            .then(function (d) { if (no === permintaan) tampilkan(d); })
            .catch(function (err) { if (no === permintaan) pesan(err.message || 'Gagal memuat data kamar.', true); });
    }

    function tutup() {
        permintaan++;
        modal.hidden = true;
        document.body.classList.remove('modal-terbuka');
        if (pembuka) pembuka.focus();
    }

    document.addEventListener('click', function (e) {
        var t = e.target instanceof Element ? e.target : null;
        if (!t) return;
        var tombol = t.closest('.plat-link');
        if (tombol) { buka(tombol.getAttribute('data-id'), tombol); return; }
        if (!modal.hidden && (t === modal || t.closest('[data-tutup]'))) tutup();   // klik latar / tombol tutup
    });

    document.addEventListener('keydown', function (e) {
        if (modal.hidden) return;
        if (e.key === 'Escape') { tutup(); return; }
        if (e.key === 'Tab') {              // fokus tetap di dalam popup
            var f = modal.querySelectorAll('button, a[href]');
            if (f.length === 0) return;
            var awal = f[0], akhir = f[f.length - 1];
            if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir.focus(); }
            else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal.focus(); }
        }
    });
})();
