const Fasilitas = require('../models/fasilitasModel');
const { PER_PAGE, ambilHalaman, buatPesan, kosong, pesanError } = require('./helpers');

const pesanMaster = (err) => (err.errno === 1062 ? 'Jenis fasilitas tersebut sudah ada.' : pesanError(err));

const daftar = async (req, res) => {
  const cari = (req.query.cari || '').trim();
  const { page, offset } = ambilHalaman(req);
  const { data, total } = await Fasilitas.daftar(cari, PER_PAGE, offset);
  res.render('fasilitas/master', { data, cari, page, offset, totalHalaman: Math.ceil(total / PER_PAGE) || 1 });
};

const formTambah = (req, res) => {
  res.render('fasilitas/master-form', { item: null, action: '/fasilitas/master/tambah' });
};

const simpan = async (req, res) => {
  const { nama_fasilitas } = req.body;
  if (kosong(nama_fasilitas)) {
    return res.redirect('/fasilitas/master/tambah' + buatPesan('Nama fasilitas wajib diisi.', 'error'));
  }
  try {
    await Fasilitas.buat(nama_fasilitas.trim());
    res.redirect('/fasilitas/master' + buatPesan('Jenis fasilitas berhasil ditambahkan. Sekarang bisa dipilih pada form kamar.', 'sukses'));
  } catch (err) {
    res.redirect('/fasilitas/master/tambah' + buatPesan(pesanMaster(err), 'error'));
  }
};

const formEdit = async (req, res) => {
  const item = await Fasilitas.cariById(req.params.id);
  if (!item) {
    return res.redirect('/fasilitas/master' + buatPesan('Jenis fasilitas tidak ditemukan.', 'error'));
  }
  res.render('fasilitas/master-form', { item, action: '/fasilitas/master/' + req.params.id + '/edit' });
};

const perbarui = async (req, res) => {
  const { nama_fasilitas } = req.body;
  const kembali = '/fasilitas/master/' + req.params.id + '/edit';
  if (kosong(nama_fasilitas)) {
    return res.redirect(kembali + buatPesan('Nama fasilitas wajib diisi.', 'error'));
  }
  try {
    await Fasilitas.ubah(req.params.id, nama_fasilitas.trim());
    res.redirect('/fasilitas/master' + buatPesan('Jenis fasilitas berhasil diubah.', 'sukses'));
  } catch (err) {
    res.redirect(kembali + buatPesan(pesanMaster(err), 'error'));
  }
};

const hapus = async (req, res) => {
  try {
    const dipakai = await Fasilitas.jumlahDipakai(req.params.id);
    if (dipakai > 0) {
      return res.redirect('/fasilitas/master' + buatPesan('Jenis fasilitas masih dipakai ' + dipakai + ' kamar. Lepas dulu dari kamar tersebut.', 'error'));
    }
    await Fasilitas.hapus(req.params.id);
    res.redirect('/fasilitas/master' + buatPesan('Jenis fasilitas berhasil dihapus.', 'sukses'));
  } catch (err) {
    res.redirect('/fasilitas/master' + buatPesan(pesanError(err), 'error'));
  }
};

module.exports = { daftar, formTambah, simpan, formEdit, perbarui, hapus };