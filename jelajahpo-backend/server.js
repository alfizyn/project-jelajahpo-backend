const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

// =========================
// KONEKSI DATABASE
// =========================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jelajahpo-db'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal konek ke database:', err.message);
        return;
    }

    console.log('Berhasil konek ke database jelajahPo');
});

// =========================
// HOME
// =========================
app.get('/', (req, res) => {
    res.send('jelajahPo Backend API berjalan!');
});

// =========================
// GET WISATA
// =========================
app.get('/wisata', (req, res) => {
    const sql = 'SELECT * FROM wisata';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error GET /wisata:', err.message);

            return res.status(500).json({
                message: 'Gagal mengambil data wisata',
                error: err.message
            });
        }

        res.json(results);
    });
});

// =========================
// GET KATEGORI
// =========================
app.get('/kategori', (req, res) => {
    const sql = 'SELECT * FROM kategori';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error GET /kategori:', err.message);

            return res.status(500).json({
                message: 'Gagal mengambil data kategori',
                error: err.message
            });
        }

        res.json(results);
    });
});

// =========================
// POST WISATA
// =========================
app.post('/wisata', (req, res) => {
    const {
        nama_wisata,
        deskripsi,
        harga_tiket,
        id_kategori
    } = req.body;

    if (!nama_wisata || !harga_tiket) {
        return res.status(400).json({
            message: 'Nama Wisata dan harga_tiket wajib diisi'
        });
    }

    if (!deskripsi) {
        return res.status(400).json({
            message: 'Deskripsi wajib diisi'
        });
    }

    const sql = `
        INSERT INTO wisata
        (nama_wisata, deskripsi, harga_tiket, id_kategori, tgl_input)
        VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(
        sql,
        [nama_wisata, deskripsi, harga_tiket, id_kategori],
        (err, result) => {
            if (err) {
                console.error('Error POST /wisata:', err.message);

                return res.status(500).json({
                    message: 'Gagal menambahkan wisata',
                    error: err.message
                });
            }

            res.status(201).json({
                message: 'Wisata berhasil ditambahkan!',
                id_wisata: result.insertId
            });
        }
    );
});

// =========================
// PUT WISATA
// =========================
app.put('/wisata/:id_wisata', (req, res) => {
    const { id_wisata } = req.params;

    const {
        nama_wisata,
        deskripsi,
        harga_tiket,
        id_kategori
    } = req.body;

    if (!nama_wisata || !harga_tiket) {
        return res.status(400).json({
            message: 'Nama Wisata dan harga_tiket wajib diisi'
        });
    }

    const sql = `
        UPDATE wisata
        SET nama_wisata = ?,
            deskripsi = ?,
            harga_tiket = ?,
            id_kategori = ?
        WHERE id_wisata = ?
    `;

    db.query(
        sql,
        [
            nama_wisata,
            deskripsi,
            harga_tiket,
            id_kategori,
            id_wisata
        ],
        (err, result) => {
            if (err) {
                console.error('Error PUT /wisata:', err.message);

                return res.status(500).json({
                    message: 'Gagal mengupdate wisata',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Wisata tidak ditemukan'
                });
            }

            res.json({
                message: 'Wisata berhasil diupdate!'
            });
        }
    );
});

// =========================
// DELETE WISATA
// =========================
app.delete('/wisata/:id_wisata', (req, res) => {
    const { id_wisata } = req.params;

    const sql = 'DELETE FROM wisata WHERE id_wisata = ?';

    db.query(sql, [id_wisata], (err, result) => {
        if (err) {
            console.error('Error DELETE /wisata:', err.message);

            return res.status(500).json({
                message: 'Gagal menghapus wisata',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Wisata tidak ditemukan'
            });
        }

        res.json({
            message: 'Wisata berhasil dihapus!'
        });
    });
});

// =========================
// POST PENGGUNA
// =========================
app.post('/pengguna', async (req, res) => {
    const {
        nama,
        email,
        password,
        no_hp
    } = req.body;

    // Validasi data
    if (!nama || !email || !password) {
        return res.status(400).json({
            message: 'Nama, email, dan password wajib diisi'
        });
    }

    try {
        // Cek apakah email sudah terdaftar
        const cekEmail = 'SELECT * FROM pengguna WHERE email = ?';

        db.query(cekEmail, [email], async (err, results) => {

            if (err) {
                console.error('Error cek email:', err.message);

                return res.status(500).json({
                    message: 'Gagal mengecek email',
                    error: err.message
                });
            }

            // Jika email sudah ada
            if (results.length > 0) {
                return res.status(400).json({
                    message: 'Email sudah terdaftar, gunakan email lain'
                });
            }

            // Enkripsi password
            const hashedPassword = await bcrypt.hash(
                password,
                saltRounds
            );

            const sql = `
                INSERT INTO pengguna
                (nama, email, password, no_hp)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [nama, email, hashedPassword, no_hp],
                (err, result) => {

                    if (err) {
                        console.error(
                            'Error POST /pengguna:',
                            err.message
                        );

                        return res.status(500).json({
                            message: 'Gagal membuat akun',
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        message: 'Akun berhasil dibuat!',
                        id_pengguna: result.insertId
                    });
                }
            );
        });

    } catch (err) {
        console.error('Error bcrypt:', err.message);

        res.status(500).json({
            message: 'Gagal mengenkripsi password'
        });
    }
});

// =========================
// MENJALANKAN SERVER
// =========================
app.listen(PORT, () => {
    console.log(
        `Server jelajahPo jalan di http://localhost:${PORT}`
    );
});