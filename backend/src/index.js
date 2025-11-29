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

// Orígenes permitidos (local + producción)
const allowedOrigins = [
  'http://localhost:5173',                 // dev frontend
  process.env.FRONTEND_URL                 // prod frontend (Vercel)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir herramientas tipo Postman (sin origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
  })
);

app.use(express.json());

// Servir archivos subidos
app.use('/uploads', express.static('uploads'));

// Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    console.error('Error en healthcheck:', error);
    res.status(500).json({ error: 'Error en healthcheck' });
  }
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminUserRoutes);

// Error genérico
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ UniShare backend escuchando en http://localhost:${PORT}`);
});
