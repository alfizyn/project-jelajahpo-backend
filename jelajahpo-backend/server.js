const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jelajahpo-db'
});

db.connect(err => {
    if (err) {
        console.error('Gagal konek ke database:', err);
    } else {
        console.log('Berhasil konek ke database JelajahPo');
    }
});

app.get('/', (req, res) => {
    res.send('Selamat Datang di JelajahPo API 💄');
});

app.get('/wisata', (req, res) => {
    const sql = 'SELECT * FROM wisata';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.sqlMessage
            });
        }

        res.json(results);
    });
});

app.get('/kategori', (req, res) => {
    const sql = 'SELECT * FROM kategori';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.sqlMessage
            });
        }

        res.json(results);
    });
});

app.post('/wisata', (req, res) => {
    const {
        nama_wisata,
        deskripsi,
        harga_tiket,
        id_kategori
    } = req.body;

    // Validasi nama wisata
    if (!nama_wisata || nama_wisata.trim() === '') {
        return res.status(400).json({
            message: 'Nama Wisata wajib diisi'
        });
    }

    // Validasi deskripsi
    if (!deskripsi || deskripsi.trim() === '') {
        return res.status(400).json({
            message: 'Deskripsi wajib diisi'
        });
    }

    // Validasi harga tiket
    if (!harga_tiket) {
        return res.status(400).json({
            message: 'Harga tiket wajib diisi'
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
                return res.status(500).json({
                    error: err.sqlMessage
                });
            }

            res.status(201).json({
                message: 'Wisata berhasil ditambahkan!',
                id_wisata: result.insertId
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server JelajahPo jalan di http://localhost:${PORT}`);
});