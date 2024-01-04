const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'file_upload'
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const sql = 'INSERT INTO files (filename, originalname, mimetype, size) VALUES (?, ?, ?, ?)';

    db.execute(sql, [file.filename, file.originalname, file.mimetype, file.size], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error storing file information in the database.' });
        }

        res.json({ message: 'File uploaded successfully.' });
    });
});

app.get('/files', (req, res) => {
    const sql = 'SELECT * FROM files';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving files from the database.' });
        }

        res.json(results);
    });
});

app.get('/download/:id', (req, res) => {
    const fileId = req.params.id;
    const sql = 'SELECT * FROM files WHERE id = ?';

    db.query(sql, [fileId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving file information from the database.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'File not found.' });
        }

        const file = results[0];
        const filePath = path.join(__dirname, 'uploads', file.filename);

        res.download(filePath, file.originalname);
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
