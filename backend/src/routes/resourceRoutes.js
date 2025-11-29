import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/authMiddleware.js';
import {
  listResources,
  getResource,
  createResource
} from '../controllers/resourceController.js';
import { listComments, addComment } from '../controllers/commentController.js';
import { getRating, setRating } from '../controllers/ratingController.js';
import { pool } from '../db.js';

const router = Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// público: ver recursos
router.get('/', listResources);
router.get('/:id', getResource);

// comentarios
router.get('/:id/comments', listComments);
router.post('/:id/comments', authRequired, addComment);

// rating (requiere estar logueado para ver tu rating y poner uno)
router.get('/:id/rating', authRequired, getRating);
router.post('/:id/rating', authRequired, setRating);

// creación básica por JSON
router.post('/', authRequired, createResource);

// subir archivo + metadatos
router.post('/upload', authRequired, upload.single('file'), async (req, res) => {
  try {
    const { title, description, course, cycle, teacher } = req.body;
    const uploaderId = req.user?.id || null;

    if (!req.file) {
      return res.status(400).json({ message: 'Falta el archivo' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const result = await pool.query(
        `INSERT INTO resources
         (title, description, course, cycle, teacher, file_url, file_type, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [title, description, course, cycle, teacher, fileUrl, fileType, uploaderId]
      );
      
      

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al subir recurso con archivo' });
  }
});

export default router;
