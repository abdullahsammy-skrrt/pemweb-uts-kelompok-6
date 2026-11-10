const Pembayaran = require('../models/pembayaranModel');
const Penghuni = require('../models/penghuniModel');
const { PER_PAGE, ambilHalaman, buatPesan, kosong, pesanError } = require('./helpers');

const bacaForm = (b) => ({
    id_penghuni: b.id_penghuni,
    periode: b.periode,
    jumlah: b.jumlah,
    tanggal_bayar: b.tanggal_bayar || null,
    status: b.status
});

const daftar = async (req, res) => {
    const cari = (req.query.cari || '').trim();
    const { page, offset } = ambilHalaman(req);
    const { data, total } = await Pembayaran.daftar(cari, PER_PAGE, offset);
    res.render('pembayaran/index', { data, cari, page, offset, totalHalaman: Math.ceil(total / PER_PAGE) || 1 });
};

const formTambah = async (req, res) => {
    res.render('pembayaran/form', { item: null, action: '/pembayaran/tambah', daftarPenghuni: await Penghuni.opsiDropdown() });
};

const simpan = async (req, res) => {
    const { id_penghuni, periode, jumlah, status } = req.body;
    if (kosong(id_penghuni, periode, jumlah, status)) {
        return res.redirect('/pembayaran/tambah' + buatPesan('Penghuni, periode, jumlah, dan status wajib diisi.', 'error'));
    }
    try {
        await Pembayaran.buat(bacaForm(req.body));
        res.redirect('/pembayaran' + buatPesan('Pembayaran berhasil ditambahkan.', 'sukses'));
    } catch (err) {
        res.redirect('/pembayaran/tambah' + buatPesan(pesanError(err), 'error'));
    }
};

const formEdit = async (req, res) => {
    const item = await Pembayaran.cariById(req.params.id);
    if (!item) {
        return res.redirect('/pembayaran' + buatPesan('Data pembayaran tidak ditemukan.', 'error'));
    }
    res.render('pembayaran/form', { item, action: '/pembayaran/' + req.params.id + '/edit', daftarPenghuni: await Penghuni.opsiDropdown() });
};

const perbarui = async (req, res) => {
    const { id_penghuni, periode, jumlah, status } = req.body;
    const kembali = '/pembayaran/' + req.params.id + '/edit';
    if (kosong(id_penghuni, periode, jumlah, status)) {
        return res.redirect(kembali + buatPesan('Penghuni, periode, jumlah, dan status wajib diisi.', 'error'));
    }
    try {
        await Pembayaran.ubah(req.params.id, bacaForm(req.body));
        res.redirect('/pembayaran' + buatPesan('Pembayaran berhasil diubah.', 'sukses'));
    } catch (err) {
        res.redirect(kembali + buatPesan(pesanError(err), 'error'));
    }
};

const hapus = async (req, res) => {
    try {
        await Pembayaran.hapus(req.params.id);
        res.redirect('/pembayaran' + buatPesan('Pembayaran berhasil dihapus.', 'sukses'));
    } catch (err) {
        res.redirect('/pembayaran' + buatPesan(pesanError(err), 'error'));
    }
};

module.exports = { daftar, formTambah, simpan, formEdit, perbarui, hapus };