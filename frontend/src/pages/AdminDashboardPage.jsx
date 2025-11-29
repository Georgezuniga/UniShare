import { useEffect, useState } from 'react';
import {
  fetchAdminOverview,
  fetchAdminResourcesByCourse,
  fetchAdminResourcesByUser
} from '../api';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [byCourse, setByCourse] = useState([]);
  const [byUser, setByUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [ov, bc, bu] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminResourcesByCourse(),
        fetchAdminResourcesByUser()
      ]);

      setOverview(ov);
      setByCourse(bc);
      setByUser(bu);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <p className="text-error">{error}</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dashboard administrativo</h2>
        <p className="page-subtitle">
          Reportes estadísticos globales y por usuario.
        </p>
      </div>

      {/* Overview */}
      <div
        className="card"
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'
        }}
      >
        <div>
          <div className="card-subtitle">Usuarios registrados</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>
            {overview.totalUsers}
          </div>
        </div>
        <div>
          <div className="card-subtitle">Recursos totales</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>
            {overview.totalResources}
          </div>
        </div>
        <div>
          <div className="card-subtitle">Comentarios totales</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>
            {overview.totalComments}
          </div>
        </div>
        <div>
          <div className="card-subtitle">Rating promedio global</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>
            {overview.globalAverageRating.toFixed(1)} / 5
          </div>
        </div>
      </div>

      {/* Recursos por curso */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recursos por curso</h3>
          <p className="card-subtitle">
            Distribución de recursos agrupados por curso.
          </p>
        </div>
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(148,163,184,0.3)' }}>
              <th style={{ padding: '0.35rem 0.2rem' }}>Curso</th>
              <th style={{ padding: '0.35rem 0.2rem' }}>Recursos</th>
            </tr>
          </thead>
          <tbody>
            {byCourse.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(31,41,55,0.6)' }}>
                <td style={{ padding: '0.3rem 0.2rem' }}>{row.course}</td>
                <td style={{ padding: '0.3rem 0.2rem' }}>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recursos por usuario */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recursos por usuario</h3>
          <p className="card-subtitle">
            Ranking de usuarios según la cantidad de recursos que han subido.
          </p>
        </div>
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(148,163,184,0.3)' }}>
              <th style={{ padding: '0.35rem 0.2rem' }}>Usuario</th>
              <th style={{ padding: '0.35rem 0.2rem' }}>Correo</th>
              <th style={{ padding: '0.35rem 0.2rem' }}>Recursos subidos</th>
            </tr>
          </thead>
          <tbody>
            {byUser.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid rgba(31,41,55,0.6)' }}>
                <td style={{ padding: '0.3rem 0.2rem' }}>{row.full_name}</td>
                <td style={{ padding: '0.3rem 0.2rem' }}>{row.email}</td>
                <td style={{ padding: '0.3rem 0.2rem' }}>{row.resources_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
