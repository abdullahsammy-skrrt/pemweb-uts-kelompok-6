const pool = require('../config/db');

async function daftar(cari, limit, offset) {
    const [hitung] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM pembayaran b
        JOIN penghuni p ON b.id_penghuni = p.id_penghuni
        JOIN kamar k ON p.id_kamar = k.id_kamar
        WHERE p.nama LIKE CONCAT('%', ?, '%') OR b.periode LIKE CONCAT('%', ?, '%') OR k.nomor_kamar LIKE CONCAT('%', ?, '%')`,
        [cari, cari, cari]
    );
    const [data] = await pool.execute(
        `SELECT b.id_pembayaran, b.periode, b.jumlah, b.tanggal_bayar, b.status, p.nama, k.nomor_kamar
        FROM pembayaran b
        JOIN penghuni p ON b.id_penghuni = p.id_penghuni
        JOIN kamar k ON p.id_kamar = k.id_kamar
        WHERE p.nama LIKE CONCAT('%', ?, '%') OR b.periode LIKE CONCAT('%', ?, '%') OR k.nomor_kamar LIKE CONCAT('%', ?, '%')
        ORDER BY b.periode DESC, p.nama
        LIMIT ? OFFSET ?`,
        [cari, cari, cari, String(limit), String(offset)]
    );
    return { data, total: hitung[0].total };
}

async function cariById(id) {
    const [rows] = await pool.execute('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id]);
    return rows[0] || null;
}

async function buat(d) {
    await pool.execute(
        'INSERT INTO pembayaran (id_penghuni, periode, jumlah, tanggal_bayar, status) VALUES (?, ?, ?, ?, ?)',
        [d.id_penghuni, d.periode, d.jumlah, d.tanggal_bayar, d.status]
    );
}

async function ubah(id, d) {
    await pool.execute(
        'UPDATE pembayaran SET id_penghuni = ?, periode = ?, jumlah = ?, tanggal_bayar = ?, status = ? WHERE id_pembayaran = ?',
        [d.id_penghuni, d.periode, d.jumlah, d.tanggal_bayar, d.status, id]
    );
}

async function hapus(id) {
    await pool.execute('DELETE FROM pembayaran WHERE id_pembayaran = ?', [id]);
}

module.exports = { daftar, cariById, buat, ubah, hapus };