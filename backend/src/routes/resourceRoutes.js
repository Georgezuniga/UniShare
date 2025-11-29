import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRequired, adminRequired } from '../middleware/authMiddleware.js';
import {
  listResources,
  getResource,
  createResource
} from '../controllers/resourceController.js';
import { listComments, addComment } from '../controllers/commentController.js';
import { getRating, setRating } from '../controllers/ratingController.js';
import { createReport, listReportsByResource } from '../controllers/reportController.js';
import { pool } from '../db.js';

const router = Router();

// Helpers para rutas de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer en disco (como ya lo tenías)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ---------- Recursos públicos ----------
router.get('/', listResources);
router.get('/:id', getResource);

// ---------- Comentarios ----------
router.get('/:id/comments', listComments);
router.post('/:id/comments', authRequired, addComment);

// ---------- Rating ----------
router.get('/:id/rating', authRequired, getRating);
router.post('/:id/rating', authRequired, setRating);

// ---------- Crear recurso vía JSON ----------
router.post('/', authRequired, createResource);

// ---------- Subir archivo + metadatos ----------
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
    console.error('Error al subir recurso con archivo:', err);
    res.status(500).json({ message: 'Error al subir recurso con archivo' });
  }
});

// ---------- Eliminar recurso (solo admin) ----------
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);

    const resourceRes = await pool.query(
      'SELECT file_url FROM resources WHERE id = $1',
      [resourceId]
    );

    if (resourceRes.rowCount === 0) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    const fileUrl = resourceRes.rows[0].file_url;

    // Eliminar de la BD
    await pool.query('DELETE FROM resources WHERE id = $1', [resourceId]);

    // Intentar eliminar el archivo físico si es local
    if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const relativePath = fileUrl.replace(/^\//, ''); // quita "/" inicial
      const filePath = path.join(__dirname, '..', '..', relativePath);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('No se pudo eliminar el archivo físico:', err.message);
        }
      });
    }

    return res.json({ message: 'Recurso eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar recurso:', err);
    return res.status(500).json({ message: 'Error al eliminar recurso' });
  }
});

// ---------- Reportes de recursos ----------
// Crear reporte (usuario logueado)
router.post('/:id/reports', authRequired, createReport);

// Listar reportes de un recurso (solo admin)
router.get('/:id/reports', authRequired, adminRequired, listReportsByResource);

export default router;
