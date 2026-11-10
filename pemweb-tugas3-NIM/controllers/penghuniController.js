// controllers/penghuniController.js - CRUD modul Penghuni (relasi: penghuni -> kamar)
const pool = require('../db');
const { PER_PAGE, ambilHalaman, buatPesan, kosong, pesanError } = require('../helpers');

// Daftar kamar untuk dropdown pada formulir
async function ambilKamar() {
  const [rows] = await pool.execute('SELECT id_kamar, nomor_kamar FROM kamar ORDER BY nomor_kamar');
  return rows;
}

// Sinkronkan status kamar dengan jumlah penghuni aktif di dalamnya:
//  - ada penghuni aktif  -> kamar 'kosong'  menjadi 'terisi'
//  - tidak ada penghuni aktif -> kamar 'terisi' menjadi 'kosong'
// Kamar berstatus 'perbaikan' tidak pernah diubah.
async function sinkronKamar(conn, idKamar) {
  await conn.execute(
    `UPDATE kamar SET status = 'terisi'
     WHERE id_kamar = ? AND status = 'kosong'
       AND EXISTS (SELECT 1 FROM penghuni WHERE id_kamar = ? AND status = 'aktif')`,
    [idKamar, idKamar]
  );
  await conn.execute(
    `UPDATE kamar SET status = 'kosong'
     WHERE id_kamar = ? AND status = 'terisi'
       AND NOT EXISTS (SELECT 1 FROM penghuni WHERE id_kamar = ? AND status = 'aktif')`,
    [idKamar, idKamar]
  );
}

// READ: daftar penghuni (JOIN kamar) + filter + paginasi
const daftar = async (req, res) => {
  const cari = (req.query.cari || '').trim();
  const { page, offset } = ambilHalaman(req);

  const [hitung] = await pool.execute('SELECT COUNT(*) AS total FROM penghuni p JOIN kamar k ON p.id_kamar = k.id_kamar WHERE p.nama LIKE CONCAT(\'%\', ?, \'%\') OR k.nomor_kamar LIKE CONCAT(\'%\', ?, \'%\')', [cari, cari]);
  const [data] = await pool.execute('SELECT p.id_penghuni, p.nama, p.no_hp, p.tanggal_masuk, p.status, k.nomor_kamar FROM penghuni p JOIN kamar k ON p.id_kamar = k.id_kamar WHERE p.nama LIKE CONCAT(\'%\', ?, \'%\') OR k.nomor_kamar LIKE CONCAT(\'%\', ?, \'%\') ORDER BY p.nama LIMIT ? OFFSET ?', [cari, cari, String(PER_PAGE), String(offset)]);

  res.render('penghuni/index', { data, cari, page, offset, totalHalaman: Math.ceil(hitung[0].total / PER_PAGE) || 1 });
};

// CREATE: formulir kosong
const formTambah = async (req, res) => {
  res.render('penghuni/form', { item: null, action: '/penghuni/tambah', daftarKamar: await ambilKamar() });
};

// CREATE: simpan -> sinkron status kamar -> redirect (PRG)
const simpan = async (req, res) => {
  const { id_kamar, nama, no_hp, tanggal_masuk, status } = req.body;
  if (kosong(id_kamar, nama, tanggal_masuk, status)) {
    return res.redirect('/penghuni/tambah' + buatPesan('Kamar, nama, tanggal masuk, dan status wajib diisi.', 'error'));
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('INSERT INTO penghuni (id_kamar, nama, no_hp, tanggal_masuk, status) VALUES (?, ?, ?, ?, ?)', [id_kamar, nama.trim(), no_hp || null, tanggal_masuk, status]);
    await sinkronKamar(conn, id_kamar);
    await conn.commit();
    res.redirect('/penghuni' + buatPesan('Penghuni berhasil ditambahkan.', 'sukses'));
  } catch (err) {
    await conn.rollback();
    res.redirect('/penghuni/tambah' + buatPesan(pesanError(err), 'error'));
  } finally {
    conn.release();
  }
};

// UPDATE: formulir berisi data lama
const formEdit = async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM penghuni WHERE id_penghuni = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.redirect('/penghuni' + buatPesan('Data penghuni tidak ditemukan.', 'error'));
  }
  res.render('penghuni/form', { item: rows[0], action: '/penghuni/' + req.params.id + '/edit', daftarKamar: await ambilKamar() });
};

// UPDATE: ubah -> sinkron kamar lama & baru -> redirect (PRG)
const perbarui = async (req, res) => {
  const { id_kamar, nama, no_hp, tanggal_masuk, status } = req.body;
  if (kosong(id_kamar, nama, tanggal_masuk, status)) {
    return res.redirect('/penghuni/' + req.params.id + '/edit' + buatPesan('Kamar, nama, tanggal masuk, dan status wajib diisi.', 'error'));
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Simpan kamar lama, karena penghuni bisa dipindah ke kamar lain
    const [lama] = await conn.execute('SELECT id_kamar FROM penghuni WHERE id_penghuni = ?', [req.params.id]);
    await conn.execute('UPDATE penghuni SET id_kamar = ?, nama = ?, no_hp = ?, tanggal_masuk = ?, status = ? WHERE id_penghuni = ?', [id_kamar, nama.trim(), no_hp || null, tanggal_masuk, status, req.params.id]);
    if (lama.length > 0 && String(lama[0].id_kamar) !== String(id_kamar)) {
      await sinkronKamar(conn, lama[0].id_kamar); // kamar yang ditinggalkan
    }
    await sinkronKamar(conn, id_kamar); // kamar yang sekarang
    await conn.commit();
    res.redirect('/penghuni' + buatPesan('Penghuni berhasil diubah.', 'sukses'));
  } catch (err) {
    await conn.rollback();
    res.redirect('/penghuni/' + req.params.id + '/edit' + buatPesan(pesanError(err), 'error'));
  } finally {
    conn.release();
  }
};

// DELETE -> hapus riwayat pembayaran -> hapus penghuni -> sinkron status kamar -> redirect (PRG)
// Dipakai saat penghuni pindah/berhenti sewa dan admin ingin menghapus datanya sepenuhnya.
const hapus = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT id_kamar FROM penghuni WHERE id_penghuni = ?', [req.params.id]);
    // Tabel pembayaran memakai ON DELETE RESTRICT, jadi pembayaran harus dihapus lebih dulu
    await conn.execute('DELETE FROM pembayaran WHERE id_penghuni = ?', [req.params.id]);
    await conn.execute('DELETE FROM penghuni WHERE id_penghuni = ?', [req.params.id]);
    if (rows.length > 0) {
      await sinkronKamar(conn, rows[0].id_kamar);
    }
    await conn.commit();
    res.redirect('/penghuni' + buatPesan('Penghuni berhasil dihapus.', 'sukses'));
  } catch (err) {
    await conn.rollback();
    res.redirect('/penghuni' + buatPesan(pesanError(err), 'error'));
  } finally {
    conn.release();
  }
};

// DELETE BANYAK: hapus beberapa penghuni terpilih (checkbox) sekaligus beserta riwayat pembayarannya
const hapusBanyak = async (req, res) => {
  // 'ids' bisa berupa string (1 dipilih) atau array (banyak dipilih); hanya terima angka
  const ids = [].concat(req.body.ids || []).map(String).filter((v) => /^\d+$/.test(v));
  if (ids.length === 0) {
    return res.redirect('/penghuni' + buatPesan('Pilih minimal satu penghuni untuk dihapus.', 'error'));
  }
  const tanda = ids.map(() => '?').join(', ');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Catat dulu kamar-kamar yang terdampak, sebelum penghuninya dihapus
    const [kamar] = await conn.execute('SELECT DISTINCT id_kamar FROM penghuni WHERE id_penghuni IN (' + tanda + ')', ids);
    await conn.execute('DELETE FROM pembayaran WHERE id_penghuni IN (' + tanda + ')', ids);
    const [hasil] = await conn.execute('DELETE FROM penghuni WHERE id_penghuni IN (' + tanda + ')', ids);
    for (const k of kamar) {
      await sinkronKamar(conn, k.id_kamar);
    }
    await conn.commit();
    res.redirect('/penghuni' + buatPesan(hasil.affectedRows + ' penghuni berhasil dihapus.', 'sukses'));
  } catch (err) {
    await conn.rollback();
    res.redirect('/penghuni' + buatPesan(pesanError(err), 'error'));
  } finally {
    conn.release();
  }
};

module.exports = {
  daftar,
  formTambah,
  simpan,
  formEdit,
  perbarui,
  hapus,
  hapusBanyak
};
