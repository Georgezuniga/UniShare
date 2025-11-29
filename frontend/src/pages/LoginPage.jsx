import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, width: '100%' }}>
      <div className="card-header">
        <h2 className="card-title">Iniciar sesión</h2>
        <p className="card-subtitle">
          Usa tu cuenta para acceder a los recursos compartidos.
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Correo</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tucorreo@ulima.edu.pe"
          />
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

        {error && <p className="text-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <div className="auth-links">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Crear cuenta nueva
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/forgot-password')}
          >
            Olvidé mi contraseña
          </button>
        </div>
      </form>
    </div>
  );
}
