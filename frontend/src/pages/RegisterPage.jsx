import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

export default function RegisterPage({ onLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        full_name: fullName,
        email,
        password,
      });

      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.message ||
        'No se pudo crear la cuenta. Inténtalo nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 460, width: '100%' }}>
      <div className="card-header">
        <h2 className="card-title">Crear cuenta</h2>
        <p className="card-subtitle">
          Regístrate con tu correo institucional para usar UniShare.
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            className="form-input"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            placeholder="Geron Admin"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Correo institucional</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tucorreo@ulima.edu.pe"
          />
          <p className="form-hint">
            Solo se permiten correos con dominio <strong>@ulima.edu.pe</strong>.
          </p>
        </div>

        <div className="form-field">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Repetir contraseña</label>
          <input
            type="password"
            className="form-input"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>

        <div className="auth-links">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/')}
          >
            Ya tengo cuenta · Iniciar sesión
          </button>
        </div>
      </form>
    </div>
  );
}
