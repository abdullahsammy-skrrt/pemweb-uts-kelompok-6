const Kamar = require('../models/kamarModel');
const Fasilitas = require('../models/fasilitasModel');
const FasilitasKamar = require('../models/fasilitaskamarModel');
const { PER_PAGE, ambilHalaman, buatPesan, kosong, pesanError, bacaFasilitas } = require('./helpers');

async function petaTerpilih(idKamar) {
  const peta = {};
  (await FasilitasKamar.perKamar(idKamar)).forEach((r) => {
    peta[r.id_fasilitas] = { kondisi: r.kondisi, keterangan: r.keterangan || '' };
  });
  return peta;
}

const daftar = async (req, res) => {
  const cari = (req.query.cari || '').trim();
  const { page, offset } = ambilHalaman(req);
  const { data, total } = await Kamar.daftar(cari, PER_PAGE, offset);
  res.render('kamar/index', { data, cari, page, offset, totalHalaman: Math.ceil(total / PER_PAGE) || 1 });
};

const detail = async (req, res) => {
  const hasil = await Kamar.detail(req.params.id);
  if (!hasil) {
    return res.status(404).json({ error: 'Data kamar tidak ditemukan.' });
  }
  res.json(hasil);
};

const formTambah = async (req, res) => {
  res.render('kamar/form', { item: null, action: '/kamar/tambah', daftarFasilitas: await Fasilitas.semua(), terpilih: {} });
};

const simpan = async (req, res) => {
  const { nomor_kamar, tipe, harga_bulanan, status } = req.body;
  if (kosong(nomor_kamar, harga_bulanan, status)) {
    return res.redirect('/kamar/tambah' + buatPesan('Nomor kamar, harga, dan status wajib diisi.', 'error'));
  }
  const { daftar: daftarFasilitas, error } = bacaFasilitas(req.body);
  if (error) {
    return res.redirect('/kamar/tambah' + buatPesan(error, 'error'));
  }
  try {
    await Kamar.buat({ nomor_kamar: nomor_kamar.trim(), tipe: tipe || null, harga_bulanan, status }, daftarFasilitas);
    res.redirect('/kamar' + buatPesan('Kamar dan fasilitasnya berhasil ditambahkan.', 'sukses'));
  } catch (err) {
    res.redirect('/kamar/tambah' + buatPesan(pesanError(err), 'error'));
  }
};

const formEdit = async (req, res) => {
  const item = await Kamar.cariById(req.params.id);
  if (!item) {
    return res.redirect('/kamar' + buatPesan('Data kamar tidak ditemukan.', 'error'));
  }
  res.render('kamar/form', {
    item,
    action: '/kamar/' + req.params.id + '/edit',
    daftarFasilitas: await Fasilitas.semua(),
    terpilih: await petaTerpilih(req.params.id)
  });
};

const perbarui = async (req, res) => {
  const { nomor_kamar, tipe, harga_bulanan, status } = req.body;
  const kembali = '/kamar/' + req.params.id + '/edit';
  if (kosong(nomor_kamar, harga_bulanan, status)) {
    return res.redirect(kembali + buatPesan('Nomor kamar, harga, dan status wajib diisi.', 'error'));
  }
  const { daftar: daftarFasilitas, error } = bacaFasilitas(req.body);
  if (error) {
    return res.redirect(kembali + buatPesan(error, 'error'));
  }
  try {
    const ada = await Kamar.ubah(req.params.id, { nomor_kamar: nomor_kamar.trim(), tipe: tipe || null, harga_bulanan, status }, daftarFasilitas);
    if (!ada) {
      return res.redirect('/kamar' + buatPesan('Data kamar tidak ditemukan.', 'error'));
    }
    res.redirect('/kamar' + buatPesan('Kamar dan fasilitasnya berhasil diubah.', 'sukses'));
  } catch (err) {
    res.redirect(kembali + buatPesan(pesanError(err), 'error'));
  }
};

const hapus = async (req, res) => {
  try {
    await Kamar.hapus(req.params.id);
    res.redirect('/kamar' + buatPesan('Kamar berhasil dihapus.', 'sukses'));
  } catch (err) {
    res.redirect('/kamar' + buatPesan(pesanError(err), 'error'));
  }
};

module.exports = { daftar, detail, formTambah, simpan, formEdit, perbarui, hapus };