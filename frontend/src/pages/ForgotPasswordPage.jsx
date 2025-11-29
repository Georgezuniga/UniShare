import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSentMessage('');
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setSentMessage(
        data?.message ||
          'Si el correo existe, se enviarán instrucciones de recuperación.'
      );
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          'No se pudo procesar la solicitud. Inténtalo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 460, width: '100%' }}>
      <div className="card-header">
        <h2 className="card-title">Recuperar contraseña</h2>
        <p className="card-subtitle">
          Ingresa tu correo institucional para recibir instrucciones.
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
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
        </div>

        {error && <p className="text-error">{error}</p>}
        {sentMessage && (
          <p className="text-success">{sentMessage}</p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>

        <div className="auth-links">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/')}
          >
            Volver a iniciar sesión
          </button>
        </div>
      </form>
    </div>
  );
}
