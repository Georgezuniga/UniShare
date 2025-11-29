import { useState } from 'react';

export default function UploadResourcePage({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [cycle, setCycle] = useState('');
  const [teacher, setTeacher] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!file) {
      setMessage('Selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('course', course);
    formData.append('cycle', cycle);
    formData.append('teacher', teacher);

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + '/resources/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!res.ok) {
        setMessage('Error al subir recurso');
        return;
      }

      setMessage('Recurso subido correctamente');
      setTitle('');
      setDescription('');
      setCourse('');
      setCycle('');
      setTeacher('');
      setFile(null);

      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error(err);
      setMessage('Error de conexión');
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label">Título</label>
        <input
          className="form-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label className="form-label">Descripción</label>
        <textarea
  className="form-textarea"
  value={description}
  onChange={e => setDescription(e.target.value)}
  style={{ minHeight: "240px" }}   // 👈 más grande
/>

      </div>

      <div className="form-field">
        <label className="form-label">Curso</label>
        <input
          className="form-input"
          value={course}
          onChange={e => setCourse(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Ciclo</label>
        <input
          className="form-input"
          value={cycle}
          onChange={e => setCycle(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Docente</label>
        <input
          className="form-input"
          value={teacher}
          onChange={e => setTeacher(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Archivo</label>
        <input
          id="file-input"
          type="file"
          className="form-input"
          onChange={e => setFile(e.target.files[0])}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Subir recurso
      </button>

      {message && <p className="text-success" style={{ marginTop: '0.5rem' }}>{message}</p>}
    </form>
  );
}
