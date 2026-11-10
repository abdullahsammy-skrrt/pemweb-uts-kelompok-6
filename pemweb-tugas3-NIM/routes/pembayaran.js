// routes/pembayaran.js - hanya memetakan URL ke fungsi di controllers/pembayaranController.js
const express = require('express');
const c = require('../controllers/pembayaranController');
const { cekId } = require('../controllers/helpers');
const router = express.Router();
router.param('id', cekId('/pembayaran')); // tolak :id yang bukan angka

router.get('/', c.daftar);
router.get('/tambah', c.formTambah);
router.post('/tambah', c.simpan);
router.get('/:id/edit', c.formEdit);
router.post('/:id/edit', c.perbarui);
router.post('/:id/hapus', c.hapus);

module.exports = router;
