const pool = require('../config/db');
const FasilitasKamar = require('./fasilitaskamarModel');

async function daftar(cari, limit, offset) {
    const [hitung] = await pool.execute(
        `SELECT COUNT(*) AS total FROM kamar
        WHERE nomor_kamar LIKE CONCAT('%', ?, '%') OR tipe LIKE CONCAT('%', ?, '%')`,
        [cari, cari]
    );
    const [data] = await pool.execute(
        `SELECT * FROM kamar
        WHERE nomor_kamar LIKE CONCAT('%', ?, '%') OR tipe LIKE CONCAT('%', ?, '%')
        ORDER BY (status = 'terisi') DESC, nomor_kamar
        LIMIT ? OFFSET ?`,
        [cari, cari, String(limit), String(offset)]
    );
    return { data, total: hitung[0].total };
}

async function cariById(id) {
    const [rows] = await pool.execute('SELECT * FROM kamar WHERE id_kamar = ?', [id]);
    return rows[0] || null;
}

async function opsiDropdown() {
    const [rows] = await pool.execute('SELECT id_kamar, nomor_kamar FROM kamar ORDER BY nomor_kamar');
    return rows;
}

async function detail(id) {
    const [kamar] = await pool.execute(
        'SELECT id_kamar, nomor_kamar, tipe, harga_bulanan, status FROM kamar WHERE id_kamar = ?',
        [id]
    );
    if (kamar.length === 0) return null;

    const [penghuni] = await pool.execute(
        `SELECT p.id_penghuni, p.nama, p.no_hp, p.tanggal_masuk,
        b.periode AS periode_bayar, b.jumlah AS jumlah_bayar, b.tanggal_bayar, b.status AS status_bayar
        FROM penghuni p
        LEFT JOIN pembayaran b ON b.id_penghuni = p.id_penghuni
        AND b.periode = (SELECT MAX(b2.periode) FROM pembayaran b2 WHERE b2.id_penghuni = p.id_penghuni)
        WHERE p.id_kamar = ? AND p.status = 'aktif'
        ORDER BY p.nama`,
        [id]
    );
    const [fasilitas] = await pool.execute(
        `SELECT f.nama_fasilitas, fk.kondisi, fk.keterangan
        FROM fasilitas_kamar fk JOIN fasilitas f ON fk.id_fasilitas = f.id_fasilitas
        WHERE fk.id_kamar = ? ORDER BY f.nama_fasilitas`,
        [id]
    );
    return { kamar: kamar[0], penghuni, fasilitas };
}

async function buat(d, daftarFasilitas) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [hasil] = await conn.execute(
            'INSERT INTO kamar (nomor_kamar, tipe, harga_bulanan, status) VALUES (?, ?, ?, ?)',
            [d.nomor_kamar, d.tipe, d.harga_bulanan, d.status]
        );
        await FasilitasKamar.sinkronkan(conn, hasil.insertId, daftarFasilitas);
        await conn.commit();
        return hasil.insertId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

async function ubah(id, d, daftarFasilitas) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute(
            'UPDATE kamar SET nomor_kamar = ?, tipe = ?, harga_bulanan = ?, status = ? WHERE id_kamar = ?',
            [d.nomor_kamar, d.tipe, d.harga_bulanan, d.status, id]
        );
        const [ada] = await conn.execute('SELECT 1 FROM kamar WHERE id_kamar = ?', [id]);
        if (ada.length === 0) {
            await conn.rollback();
            return false;
        }
        await FasilitasKamar.sinkronkan(conn, id, daftarFasilitas);
        await conn.commit();
        return true;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

async function hapus(id) {
    await pool.execute('DELETE FROM kamar WHERE id_kamar = ?', [id]);
}

module.exports = { daftar, cariById, opsiDropdown, detail, buat, ubah, hapus };