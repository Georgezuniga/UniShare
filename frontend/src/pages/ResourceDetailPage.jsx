import { useEffect, useState } from 'react';
import {
  fetchComments,
  addComment,
  fetchRating,
  setRating,
} from '../api';

export default function ResourceDetailPage({ resource, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [ratingInfo, setRatingInfo] = useState({
    average: 0,
    count: 0,
    userRating: null,
  });
  const [ratingError, setRatingError] = useState('');
  const [savingRating, setSavingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(null);

  // ---------- HELPER PARA URL DEL ARCHIVO ----------
  const API_URL = import.meta.env.VITE_API_URL || '';

  // si tiene /api lo cortamos, si no, usamos tal cual
  const BACKEND_BASE_URL = API_URL.includes('/api')
    ? API_URL.split('/api')[0]
    : API_URL;

  function getFileUrl(fileUrl) {
    if (!fileUrl) return '';

    // si ya es URL absoluta, la devolvemos tal cual
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    let path = fileUrl;

    // asegurar que empiece por "/"
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // 🔧 FIX DURO: cualquier "/api/uploads" lo convertimos a "/uploads"
    path = path.replace('/api/uploads', '/uploads');

    // por si viniera "/api/loquesea/uploads", también limpiamos un "/api" inicial
    path = path.replace(/^\/api\//, '/');

    return `${BACKEND_BASE_URL}${path}`;
  }

  const finalFileUrl = getFileUrl(resource?.file_url);

  // ---------- CARGA INICIAL ----------
  useEffect(() => {
    if (!resource) return;

    const load = async () => {
      try {
        setLoadingComments(true);
        const [commentsRes, ratingRes] = await Promise.all([
          fetchComments(resource.id),
          fetchRating(resource.id),
        ]);

        setComments(commentsRes);
        setRatingInfo(ratingRes);
      } catch (err) {
        console.error('Error al cargar detalle de recurso:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    load();
  }, [resource?.id]);

  if (!resource) {
    return null;
  }

  // ---------- COMENTARIOS ----------
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentError('');
      const created = await addComment(resource.id, newComment.trim());
      setComments(prev => [created, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      setCommentError('Error al agregar comentario');
    }
  }

  // ---------- RATING CON ESTRELLAS ----------
  async function handleStarClick(value) {
    try {
      setSavingRating(true);
      setRatingError('');
      await setRating(resource.id, value);
      const info = await fetchRating(resource.id);
      setRatingInfo(info);
    } catch (err) {
      console.error(err);
      setRatingError('Error al guardar rating');
    } finally {
      setSavingRating(false);
      setHoverRating(null);
    }
  }

  const displayUserRating =
    hoverRating != null ? hoverRating : ratingInfo.userRating;

  return (
    <div>
      {/* CABECERA DEL RECURSO */}
      <section className="resource-detail-header">
        <h2 className="page-title">{resource.title}</h2>
        <p className="page-subtitle">{resource.description}</p>

        <div className="resource-meta">
          <p>
            <strong>Curso:</strong> {resource.course || '—'}
          </p>
          <p>
            <strong>Ciclo:</strong> {resource.cycle || '—'}
          </p>
          <p>
            <strong>Docente:</strong> {resource.teacher || '—'}
          </p>
        </div>

        <div className="resource-actions">
          {finalFileUrl && (
            <a
              href={finalFileUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              Abrir archivo
            </a>
          )}
        </div>
      </section>

      {/* VALORACIÓN */}
      <section className="rating-section">
        <h3 className="section-title">Valoración</h3>

        {ratingInfo.count > 0 ? (
          <p className="rating-summary">
            Promedio:{' '}
            <strong>
              {ratingInfo.average.toFixed(1)} / 5
            </strong>{' '}
            ({ratingInfo.count}{' '}
            {ratingInfo.count === 1 ? 'voto' : 'votos'})
          </p>
        ) : (
          <p className="rating-summary">Este recurso aún no tiene valoraciones.</p>
        )}

        <div className="rating-stars-row">
          <span className="rating-stars-label">
            Tu calificación:
          </span>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                className={
                  'star-button ' +
                  (value <= (displayUserRating || 0) ? 'filled' : '')
                }
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleStarClick(value)}
                disabled={savingRating}
                aria-label={`Calificar con ${value} estrella${
                  value > 1 ? 's' : ''
                }`}
              >
                ★
              </button>
            ))}
            {displayUserRating ? (
              <span className="rating-value-text">
                {displayUserRating} / 5
              </span>
            ) : (
              <span className="rating-value-text rating-placeholder">
                Haz clic en una estrella para valorar
              </span>
            )}
          </div>
        </div>

        {ratingError && <p className="text-error">{ratingError}</p>}
      </section>

      {/* COMENTARIOS */}
      <section className="comments-section">
        <h3 className="section-title">Comentarios</h3>

        {loadingComments ? (
          <p>Cargando comentarios...</p>
        ) : (
          <>
            {comments.length === 0 && (
              <p className="comments-empty">
                Aún no hay comentarios. Sé el primero en comentar.
              </p>
            )}

            <ul className="comments-list">
              {comments.map(comment => {
                const username =
                  comment.user_full_name ||
                  comment.full_name ||
                  comment.username ||
                  comment.user_name ||
                  comment.user?.full_name ||
                  'Usuario';

                return (
                  <li key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{username}</strong>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="comment-content">
                      {comment.content}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <form className="form" onSubmit={handleAddComment}>
          <label className="form-label">Agregar comentario</label>
          <textarea
            className="form-input"
            rows={3}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          {commentError && (
            <p className="text-error">{commentError}</p>
          )}
          <button type="submit" className="btn btn-secondary">
            Comentar
          </button>
        </form>
      </section>
    </div>
  );
}
