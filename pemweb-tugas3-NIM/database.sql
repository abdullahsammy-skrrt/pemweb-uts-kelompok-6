-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versi server:                 8.0.30 - MySQL Community Server - GPL
-- OS Server:                    Win64
-- HeidiSQL Versi:               12.1.0.6537
-- --------------------------------------------------------
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;

/*!40101 SET NAMES utf8 */;

/*!50503 SET NAMES utf8mb4 */;

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;

/*!40103 SET TIME_ZONE='+00:00' */;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;

/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Membuang struktur basisdata untuk kos_db
CREATE DATABASE IF NOT EXISTS `kos_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `kos_db`;

-- membuang struktur untuk table kos_db.fasilitas
CREATE TABLE
	IF NOT EXISTS `fasilitas` (
		`id_fasilitas` int unsigned NOT NULL AUTO_INCREMENT,
		`nama_fasilitas` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
		PRIMARY KEY (`id_fasilitas`),
		UNIQUE KEY `uq_nama_fasilitas` (`nama_fasilitas`)
	) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Membuang data untuk tabel kos_db.fasilitas: ~8 rows (lebih kurang)
INSERT INTO
	`fasilitas` (`id_fasilitas`, `nama_fasilitas`)
VALUES
	(19, '2 Kamar Tidur'),
	(20, '3 Kamar Tidur'),
	(5, 'AC'),
	(21, 'Balkon'),
	(15, 'Dapur Pribadi'),
	(14, 'Dapur Umum'),
	(24, 'Kamar Mandi Pribadi'),
	(23, 'Kamar Mandi Umum'),
	(1, 'Kasur'),
	(3, 'Kipas Angin'),
	(2, 'Lemari'),
	(8, 'Meja'),
	(18, 'Ruang Tamu'),
	(10, 'sofa'),
	(22, 'Tambahan Fasilitas'),
	(11, 'TV 32 Inch'),
	(12, 'TV 50 Inch'),
	(7, 'Water Heater'),
	(4, 'WiFi');

-- membuang struktur untuk table kos_db.fasilitas_kamar
CREATE TABLE
	IF NOT EXISTS `fasilitas_kamar` (
		`id_fasilitas_kamar` int unsigned NOT NULL AUTO_INCREMENT,
		`id_kamar` int unsigned NOT NULL,
		`id_fasilitas` int unsigned NOT NULL,
		`kondisi` enum ('baik', 'rusak') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'baik',
		`keterangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'keterangan kerusakan, diisi bila kondisi = rusak',
		PRIMARY KEY (`id_fasilitas_kamar`),
		UNIQUE KEY `uq_kamar_fasilitas` (`id_kamar`, `id_fasilitas`),
		KEY `fk_fk_fasilitas` (`id_fasilitas`),
		CONSTRAINT `fk_fk_fasilitas` FOREIGN KEY (`id_fasilitas`) REFERENCES `fasilitas` (`id_fasilitas`) ON DELETE RESTRICT ON UPDATE CASCADE,
		CONSTRAINT `fk_fk_kamar` FOREIGN KEY (`id_kamar`) REFERENCES `kamar` (`id_kamar`) ON DELETE CASCADE ON UPDATE CASCADE
	) ENGINE = InnoDB AUTO_INCREMENT = 120 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Membuang data untuk tabel kos_db.fasilitas_kamar: ~11 rows (lebih kurang)
INSERT INTO
	`fasilitas_kamar` (
		`id_fasilitas_kamar`,
		`id_kamar`,
		`id_fasilitas`,
		`kondisi`,
		`keterangan`
	)
VALUES
	(1, 1, 1, 'baik', NULL),
	(2, 1, 2, 'baik', NULL),
	(3, 1, 8, 'baik', NULL),
	(4, 2, 1, 'baik', NULL),
	(6, 3, 4, 'baik', NULL),
	(13, 4, 1, 'baik', NULL),
	(14, 4, 3, 'baik', NULL),
	(18, 1, 19, 'baik', NULL),
	(19, 1, 5, 'baik', NULL),
	(20, 1, 15, 'baik', NULL),
	(24, 1, 18, 'baik', NULL),
	(25, 1, 11, 'baik', NULL),
	(26, 1, 4, 'baik', NULL),
	(48, 1, 24, 'baik', NULL),
	(55, 2, 19, 'baik', NULL),
	(56, 2, 5, 'baik', NULL),
	(57, 2, 15, 'baik', NULL),
	(58, 2, 24, 'baik', NULL),
	(60, 2, 2, 'baik', NULL),
	(61, 2, 8, 'baik', NULL),
	(62, 2, 18, 'baik', NULL),
	(63, 2, 11, 'baik', NULL),
	(64, 2, 4, 'baik', NULL),
	(65, 3, 19, 'baik', NULL),
	(66, 3, 5, 'baik', NULL),
	(67, 3, 15, 'baik', NULL),
	(68, 3, 24, 'baik', NULL),
	(69, 3, 1, 'baik', NULL),
	(70, 3, 2, 'baik', NULL),
	(71, 3, 8, 'baik', NULL),
	(72, 3, 18, 'baik', NULL),
	(73, 3, 22, 'baik', NULL),
	(74, 3, 11, 'baik', NULL),
	(76, 4, 14, 'baik', NULL),
	(77, 4, 24, 'baik', NULL),
	(80, 5, 14, 'baik', NULL),
	(81, 5, 24, 'baik', NULL),
	(82, 5, 1, 'baik', NULL),
	(83, 5, 3, 'baik', NULL),
	(84, 6, 14, 'baik', NULL),
	(85, 6, 23, 'baik', NULL),
	(86, 6, 1, 'baik', NULL),
	(87, 6, 3, 'baik', NULL),
	(88, 7, 14, 'baik', NULL),
	(89, 7, 23, 'baik', NULL),
	(90, 7, 1, 'baik', NULL),
	(91, 7, 3, 'baik', NULL),
	(92, 8, 20, 'baik', NULL),
	(93, 8, 5, 'baik', NULL),
	(94, 8, 21, 'baik', NULL),
	(95, 8, 15, 'baik', NULL),
	(96, 8, 24, 'baik', NULL),
	(97, 8, 1, 'baik', NULL),
	(98, 8, 2, 'baik', NULL),
	(99, 8, 8, 'baik', NULL),
	(100, 8, 18, 'baik', NULL),
	(101, 8, 10, 'baik', NULL),
	(102, 8, 22, 'baik', NULL),
	(103, 8, 12, 'baik', NULL),
	(104, 8, 7, 'baik', NULL),
	(105, 8, 4, 'baik', NULL),
	(106, 9, 20, 'baik', NULL),
	(107, 9, 5, 'baik', NULL),
	(108, 9, 21, 'baik', NULL),
	(109, 9, 15, 'baik', NULL),
	(110, 9, 24, 'baik', NULL),
	(111, 9, 1, 'baik', NULL),
	(112, 9, 2, 'baik', NULL),
	(113, 9, 8, 'baik', NULL),
	(114, 9, 18, 'baik', NULL),
	(115, 9, 10, 'baik', NULL),
	(116, 9, 22, 'baik', NULL),
	(117, 9, 12, 'baik', NULL),
	(118, 9, 7, 'baik', NULL),
	(119, 9, 4, 'baik', NULL);

-- membuang struktur untuk table kos_db.kamar
CREATE TABLE
	IF NOT EXISTS `kamar` (
		`id_kamar` int unsigned NOT NULL AUTO_INCREMENT,
		`nomor_kamar` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
		`tipe` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
		`harga_bulanan` int unsigned NOT NULL,
		`status` enum ('kosong', 'terisi', 'perbaikan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kosong',
		PRIMARY KEY (`id_kamar`),
		UNIQUE KEY `uq_nomor_kamar` (`nomor_kamar`)
	) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Membuang data untuk tabel kos_db.kamar: ~4 rows (lebih kurang)
INSERT INTO
	`kamar` (
		`id_kamar`,
		`nomor_kamar`,
		`tipe`,
		`harga_bulanan`,
		`status`
	)
VALUES
	(1, 'A1', 'Elite', 3000000, 'terisi'),
	(2, 'A2', 'Elite', 3000000, 'kosong'),
	(3, 'A3', 'Elite', 3500000, 'kosong'),
	(4, 'B1', 'Standard', 800000, 'kosong'),
	(5, 'B2', 'Standrad', 800000, 'terisi'),
	(6, 'C1', 'Basic', 500000, 'terisi'),
	(7, 'C2', 'Basic', 500000, 'kosong'),
	(8, 'S1', 'Super', 7500000, 'terisi'),
	(9, 'S2', 'Super', 7000000, 'terisi');

-- membuang struktur untuk table kos_db.pembayaran
CREATE TABLE
	IF NOT EXISTS `pembayaran` (
		`id_pembayaran` int unsigned NOT NULL AUTO_INCREMENT,
		`id_penghuni` int unsigned NOT NULL,
		`periode` char(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'format YYYY-MM',
		`jumlah` int unsigned NOT NULL,
		`tanggal_bayar` date DEFAULT NULL,
		`status` enum ('lunas', 'belum', 'tertagih') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'belum',
		PRIMARY KEY (`id_pembayaran`),
		UNIQUE KEY `uq_penghuni_periode` (`id_penghuni`, `periode`),
		CONSTRAINT `fk_pembayaran_penghuni` FOREIGN KEY (`id_penghuni`) REFERENCES `penghuni` (`id_penghuni`) ON DELETE RESTRICT ON UPDATE CASCADE
	) ENGINE = InnoDB AUTO_INCREMENT = 18 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Membuang data untuk tabel kos_db.pembayaran: ~12 rows (lebih kurang)
INSERT INTO
	`pembayaran` (
		`id_pembayaran`,
		`id_penghuni`,
		`periode`,
		`jumlah`,
		`tanggal_bayar`,
		`status`
	)
VALUES
	(13, 10, '2026-11', 7500000, '2026-11-09', 'lunas'),
	(14, 11, '2026-11', 7000000, '2026-11-09', 'lunas'),
	(15, 9, '2026-11', 3000000, '2026-11-09', 'lunas'),
	(16, 8, '2026-11', 500000, '2026-11-09', 'belum'),
	(17, 7, '2026-11', 0, '2026-11-09', 'tertagih');

-- membuang struktur untuk table kos_db.penghuni
CREATE TABLE
	IF NOT EXISTS `penghuni` (
		`id_penghuni` int unsigned NOT NULL AUTO_INCREMENT,
		`id_kamar` int unsigned NOT NULL,
		`nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
		`no_hp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
		`tanggal_masuk` date NOT NULL,
		`status` enum ('aktif', 'keluar') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
		PRIMARY KEY (`id_penghuni`),
		KEY `fk_penghuni_kamar` (`id_kamar`),
		CONSTRAINT `fk_penghuni_kamar` FOREIGN KEY (`id_kamar`) REFERENCES `kamar` (`id_kamar`) ON DELETE RESTRICT ON UPDATE CASCADE
	) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Membuang data untuk tabel kos_db.penghuni: ~6 rows (lebih kurang)
INSERT INTO
	`penghuni` (
		`id_penghuni`,
		`id_kamar`,
		`nama`,
		`no_hp`,
		`tanggal_masuk`,
		`status`
	)
VALUES
	(
		7,
		6,
		'Julian Francis',
		'086495315647',
		'2026-11-09',
		'aktif'
	),
	(
		8,
		5,
		'Daffa Khairan',
		'084652317896',
		'2026-11-09',
		'aktif'
	),
	(
		9,
		1,
		'Risky Helben',
		'084658564133',
		'2026-11-09',
		'aktif'
	),
	(
		10,
		8,
		'abdullah Sami',
		'084616349166',
		'2026-11-09',
		'aktif'
	),
	(
		11,
		9,
		'Rahmat Zaki',
		'086456321245',
		'2026-11-09',
		'aktif'
	);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;

/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;