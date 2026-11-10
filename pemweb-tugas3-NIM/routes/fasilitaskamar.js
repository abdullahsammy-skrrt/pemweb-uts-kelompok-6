const express = require('express');
const c = require('../controllers/fasilitasKamarController');
const { cekId } = require('../controllers/helpers');
const router = express.Router();
router.param('id', cekId('/fasilitas'));

router.get('/', c.daftar);
router.get('/alokasi/tambah', c.formTambah);
router.post('/alokasi/tambah', c.simpan);
router.get('/alokasi/:id/edit', c.formEdit);
router.post('/alokasi/:id/edit', c.perbarui);
router.post('/alokasi/:id/hapus', c.hapus);

module.exports = router;