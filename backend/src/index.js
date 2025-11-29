// backend/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS SIMPLE: PERMITIR TODO (para demo académica)
app.use(cors());
app.use(express.json());

// Servir archivos subidos (PDF, imágenes, videos)
app.use('/uploads', express.static('uploads'));

// Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbTime: result.rows[0].now,
    });
  } catch (error) {
    console.error('Error en healthcheck:', error);
    res.status(500).json({ error: 'Error en healthcheck' });
  }
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de recursos (listar, detalle, upload, comentarios, rating)
app.use('/api/resources', resourceRoutes);

// Rutas de administración (stats, overview, resources-by-*)
app.use('/api/admin', adminRoutes);

// Rutas de gestión de usuarios admin (roles)
app.use('/api/admin', adminUserRoutes);

// Manejador genérico de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`✅ UniShare backend escuchando en http://localhost:${PORT}`);
});
