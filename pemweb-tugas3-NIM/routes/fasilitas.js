const express = require('express');
const c = require('../controllers/fasilitasController');
const { cekId } = require('../controllers/helpers');
const router = express.Router();
router.param('id', cekId('/fasilitas/master'));

router.get('/', c.daftar);
router.get('/tambah', c.formTambah);
router.post('/tambah', c.simpan);
router.get('/:id/edit', c.formEdit);
router.post('/:id/edit', c.perbarui);
router.post('/:id/hapus', c.hapus);

module.exports = router;