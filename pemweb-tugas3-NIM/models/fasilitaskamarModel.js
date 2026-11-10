const pool = require('../config/db');

async function daftarPerKamar(cari, limit, offset) {
    const [hitung] = await pool.execute(
        `SELECT COUNT(*) AS total FROM kamar k
        WHERE (k.nomor_kamar LIKE CONCAT('%', ?, '%') OR EXISTS (
        SELECT 1 FROM fasilitas_kamar fk JOIN fasilitas f ON fk.id_fasilitas = f.id_fasilitas
        WHERE fk.id_kamar = k.id_kamar AND f.nama_fasilitas LIKE CONCAT('%', ?, '%')))`,
        [cari, cari]
    );
    const [kamar] = await pool.execute(
        `SELECT k.id_kamar, k.nomor_kamar, k.tipe, k.status FROM kamar k
        WHERE (k.nomor_kamar LIKE CONCAT('%', ?, '%') OR EXISTS (
        SELECT 1 FROM fasilitas_kamar fk JOIN fasilitas f ON fk.id_fasilitas = f.id_fasilitas
        WHERE fk.id_kamar = k.id_kamar AND f.nama_fasilitas LIKE CONCAT('%', ?, '%')))
        ORDER BY k.nomor_kamar
        LIMIT ? OFFSET ?`,
        [cari, cari, String(limit), String(offset)]
    );
    for (const k of kamar) {
        const [baris] = await pool.execute(
            `SELECT fk.id_fasilitas_kamar, fk.id_kamar, f.nama_fasilitas, fk.kondisi, fk.keterangan
        FROM fasilitas_kamar fk JOIN fasilitas f ON fk.id_fasilitas = f.id_fasilitas
        WHERE fk.id_kamar = ?
        ORDER BY f.nama_fasilitas`,
            [k.id_kamar]
        );
        k.fasilitas = baris;
    }
    return { kamar, total: hitung[0].total };
}

async function cariById(id) {
    const [rows] = await pool.execute(
        `SELECT fk.id_fasilitas_kamar, fk.kondisi, fk.keterangan, f.nama_fasilitas, k.nomor_kamar
        FROM fasilitas_kamar fk
        JOIN fasilitas f ON fk.id_fasilitas = f.id_fasilitas
        JOIN kamar k ON fk.id_kamar = k.id_kamar
        WHERE fk.id_fasilitas_kamar = ?`,
        [id]
    );
    return rows[0] || null;
}

async function perKamar(idKamar) {
    const [rows] = await pool.execute(
        'SELECT id_fasilitas, kondisi, keterangan FROM fasilitas_kamar WHERE id_kamar = ?',
        [idKamar]
    );
    return rows;
}

async function tambah(idKamar, idFasilitas, kondisi, keterangan) {
    await pool.execute(
        'INSERT INTO fasilitas_kamar (id_kamar, id_fasilitas, kondisi, keterangan) VALUES (?, ?, ?, ?)',
        [idKamar, idFasilitas, kondisi, keterangan]
    );
}

async function ubahKondisi(id, kondisi, keterangan) {
    await pool.execute(
        'UPDATE fasilitas_kamar SET kondisi = ?, keterangan = ? WHERE id_fasilitas_kamar = ?',
        [kondisi, keterangan, id]
    );
}

async function lepas(id) {
    await pool.execute('DELETE FROM fasilitas_kamar WHERE id_fasilitas_kamar = ?', [id]);
}

// Dipakai form Kamar (di dalam transaksi): samakan fasilitas kamar dengan daftar dari form
async function sinkronkan(conn, idKamar, daftar) {
    const [lama] = await conn.execute('SELECT id_fasilitas FROM fasilitas_kamar WHERE id_kamar = ?', [idKamar]);
    const dipilih = new Set(daftar.map((d) => d.id));
    for (const r of lama) {
        if (!dipilih.has(String(r.id_fasilitas))) {
            await conn.execute('DELETE FROM fasilitas_kamar WHERE id_kamar = ? AND id_fasilitas = ?', [idKamar, r.id_fasilitas]);
        }
    }
    for (const d of daftar) {
        await conn.execute(
            'INSERT INTO fasilitas_kamar (id_kamar, id_fasilitas, kondisi, keterangan) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE kondisi = ?, keterangan = ?',
            [idKamar, d.id, d.kondisi, d.keterangan, d.kondisi, d.keterangan]
        );
    }
}

module.exports = { daftarPerKamar, cariById, perKamar, tambah, ubahKondisi, lepas, sinkronkan };        