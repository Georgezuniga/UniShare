import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';


const ALLOWED_DOMAIN = '@ulima.edu.pe';
export async function register(req, res, next) {
    try {
      const { full_name, email, password } = req.body;
  
      if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
      }
  
      if (!email.endsWith(ALLOWED_DOMAIN)) {
        return res.status(400).json({ message: 'Solo se permiten correos institucionales ULima' });
      }
  
      // ¿ya existe?
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
  
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
      }
  
      const password_hash = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, email, role`,
        [full_name, email, password_hash, 'user']
      );
  
      const user = result.rows[0];
  
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
  
      res.status(201).json({
        message: 'Usuario registrado correctamente',
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  }

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan credenciales' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}

export async function forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: 'El correo es obligatorio' });
      }
  
      const result = await pool.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );
  
      if (result.rows.length === 0) {
        // No revelamos si el correo existe o no (buena práctica)
        return res.json({ message: 'Si el correo existe, se enviará un enlace de recuperación' });
      }
  
      const user = result.rows[0];
  
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos
  
      await pool.query(
        `UPDATE users
         SET reset_token = $1,
             reset_expires_at = $2
         WHERE id = $3`,
        [token, expires, user.id]
      );
  
      // Simulamos envío de correo:
      console.log('TOKEN DE RECUPERACIÓN PARA', user.email, ':', token);
  
      res.json({
        message: 'Se ha enviado un enlace de recuperación al correo (simulado en consola del backend)',
      });
    } catch (err) {
      next(err);
    }
  }


  export async function resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
  
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });
      }
  
      const result = await pool.query(
        `SELECT id, reset_expires_at
         FROM users
         WHERE reset_token = $1`,
        [token]
      );
  
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Token inválido' });
      }
  
      const user = result.rows[0];
  
      if (!user.reset_expires_at || user.reset_expires_at < new Date()) {
        return res.status(400).json({ message: 'El token ha expirado' });
      }
  
      const password_hash = await bcrypt.hash(newPassword, 10);
  
      await pool.query(
        `UPDATE users
         SET password_hash = $1,
             reset_token = NULL,
             reset_expires_at = NULL
         WHERE id = $2`,
        [password_hash, user.id]
      );
  
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  }
  