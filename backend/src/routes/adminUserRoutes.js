import { Router } from 'express'
import { authRequired, adminRequired } from '../middleware/authMiddleware.js'
import { pool } from '../db.js'

const router = Router()

// 🔹 Listar usuarios
router.get('/users', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY full_name ASC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al listar usuarios' })
  }
})

// 🔹 Cambiar rol a ADMIN
router.post('/users/:id/toggle-admin', authRequired, adminRequired, async (req, res) => {
  try {
    const userId = req.params.id

    // Evitar que el admin se quite a sí mismo el acceso
    if (Number(userId) === req.user.id) {
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol' })
    }

    const result = await pool.query(`
      UPDATE users
      SET role =
        CASE
          WHEN role = 'admin' THEN 'student'
          ELSE 'admin'
        END
      WHERE id = $1
      RETURNING id, full_name, email, role
    `, [userId])

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al cambiar rol' })
  }
})

export default router
