import { pool } from '../db.js';

// GET /api/resources
export async function listResources(req, res) {
    try {
      const { q, course, teacher, cycle } = req.query;
  
      let query = 'SELECT * FROM resources WHERE 1=1';
      const params = [];
      let idx = 1;
  
      // Búsqueda básica: texto en título o descripción
      if (q) {
        query += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
        params.push(`%${q}%`);
        idx++;
      }
  
      // Búsqueda avanzada: curso (contiene, sin importar mayúsculas)
      if (course) {
        query += ` AND course ILIKE $${idx}`;
        params.push(`%${course}%`);
        idx++;
      }
  
      // Búsqueda avanzada: docente
      if (teacher) {
        query += ` AND teacher ILIKE $${idx}`;
        params.push(`%${teacher}%`);
        idx++;
      }
  
      // Búsqueda avanzada: ciclo
      if (cycle) {
        query += ` AND cycle ILIKE $${idx}`;
        params.push(`%${cycle}%`);
        idx++;
      }
  
      query += ' ORDER BY created_at DESC';
  
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al listar recursos' });
    }
  }
// GET /api/resources/:id
export async function getResource(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM resources WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener recurso' });
  }
}

// POST /api/resources
export async function createResource(req, res) {
  try {
    const { title, description, course, cycle, teacher, file_url, file_type } = req.body;

    if (!title || !file_url) {
      return res.status(400).json({ message: 'Faltan datos obligatorios (title, file_url)' });
    }

    const uploaderId = req.user?.id || null;

    const result = await pool.query(
        `INSERT INTO resources
         (title, description, course, cycle, teacher, file_url, file_type, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [title, description, course, cycle, teacher, file_url, file_type, uploaderId]
      );
      
      

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear recurso' });
  }
}
