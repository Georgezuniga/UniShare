import { useEffect, useState } from 'react';
import { fetchResources } from '../api';

export default function ResourceListPage({ onSelect }) {
  const [resources, setResources] = useState([]);

  // Campos de búsqueda
  const [q, setQ] = useState('');
  const [course, setCourse] = useState('');
  const [teacher, setTeacher] = useState('');
  const [cycle, setCycle] = useState('');

  const [loading, setLoading] = useState(false);

  async function loadResources(searchParams = {}) {
    setLoading(true);
    try {
      const data = await fetchResources(searchParams);
      setResources(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial (sin filtros)
  useEffect(() => {
    loadResources();
  }, []);

  function handleSearch() {
    const params = {};

    if (q.trim()) params.q = q.trim();
    if (course.trim()) params.course = course.trim();
    if (teacher.trim()) params.teacher = teacher.trim();
    if (cycle.trim()) params.cycle = cycle.trim();

    loadResources(params);
  }

  function handleClear() {
    setQ('');
    setCourse('');
    setTeacher('');
    setCycle('');
    loadResources(); // vuelve a traer todos
  }

  return (
    <div>
      {/* Filtros de búsqueda */}
      <div
        style={{
          marginBottom: '1rem',
          display: 'grid',
          gap: '0.5rem',
        }}
      >
        {/* Búsqueda básica */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
  <input
    placeholder="Buscar por título o descripción..."
    value={q}
    onChange={e => setQ(e.target.value)}
    className="form-input"
    style={{ flex: 1, minWidth: '200px', maxWidth: 420 }}
  />
  <button
    className="btn btn-primary"
    onClick={handleSearch}
  >
    <span className="btn-icon">🔍</span>
    <span>Buscar</span>
  </button>
  <button
    className="btn btn-ghost btn-small"
    onClick={handleClear}
  >
    <span className="btn-icon">✖</span>
    <span>Limpiar</span>
  </button>
</div>


        {/* Búsqueda avanzada */}
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          }}
        >
          <input
            placeholder="Curso (ej. Cálculo I)"
            value={course}
            onChange={e => setCourse(e.target.value)}
            className="form-input"
          />
          <input
            placeholder="Docente (ej. Muñoz)"
            value={teacher}
            onChange={e => setTeacher(e.target.value)}
            className="form-input"
          />
          <input
            placeholder="Ciclo (ej. 2024-2)"
            value={cycle}
            onChange={e => setCycle(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Resultados */}
      {loading && <p>Cargando...</p>}
      {!loading && resources.length === 0 && <p>No hay recursos.</p>}

      <ul className="resource-list">
        {resources.map(r => (
          <li key={r.id} className="resource-item">
            <div className="resource-title">{r.title}</div>
            <div className="resource-meta">
              {r.course && <span>{r.course}</span>}
              {r.course && ' · '}
              {r.teacher && <span>{r.teacher}</span>}
              {r.cycle && <> · <span>{r.cycle}</span></>}
            </div>
            {onSelect && (
  <div style={{ marginTop: '0.35rem', textAlign: 'right' }}>
    <button
      className="btn btn-secondary btn-small"
      onClick={() => onSelect(r)}
    >
      <span className="btn-icon">📄</span>
      <span>Ver detalle</span>
    </button>
  </div>
)}

          </li>
        ))}
      </ul>
    </div>
  );
}
