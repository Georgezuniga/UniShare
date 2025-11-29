import { useEffect, useState } from 'react';
import {
  fetchComments,
  addComment,
  fetchRating,
  setRating,
  reportResource,
  fetchReports,
  deleteResource,
} from '../api';

const REPORT_REASONS = [
  'Contenido ofensivo / abuso verbal',
  'Contenido sexual inapropiado',
  'Material incompleto o erróneo',
  'Spam o publicidad',
  'Derechos de autor / plagio',
  'Otro',
];

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

  // Reportes
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState('');

  // ---------- HELPER PARA URL DEL ARCHIVO ----------
  const API_URL = import.meta.env.VITE_API_URL || '';
  const BACKEND_BASE_URL = API_URL.includes('/api')
    ? API_URL.split('/api')[0]
    : API_URL;

  function getFileUrl(fileUrl) {
    if (!fileUrl) return '';

    // si ya es URL absoluta (por si en el futuro usas Cloudinary)
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    let path = fileUrl;

    // asegurar que empiece por "/"
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Normalizar bug antiguo: "/api/uploads" -> "/uploads"
    path = path.replace('/api/uploads', '/uploads');
    path = path.replace(/^\/api\//, '/');

    return `${BACKEND_BASE_URL}${path}`;
  }

  const finalFileUrl = getFileUrl(resource?.file_url);

  // ---------- CARGA INICIAL (comentarios + rating) ----------
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

  // ---------- CARGA DE REPORTES (solo admin) ----------
  useEffect(() => {
    if (!resource || !user || user.role !== 'admin') return;

    const loadReports = async () => {
      try {
        setLoadingReports(true);
        setReportsError('');
        const data = await fetchReports(resource.id);
        setReports(data);
      } catch (err) {
        console.error('Error al cargar reportes:', err);
        setReportsError('Error al cargar los reportes de este recurso');
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, [resource?.id, user?.role]);

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

  // ---------- REPORTAR RECURSO (usuario) ----------
  async function handleReportSubmit(e) {
    e.preventDefault();
    if (!user) {
      setReportError('Debes iniciar sesión para reportar un recurso.');
      return;
    }

    try {
      setSendingReport(true);
      setReportError('');
      setReportSuccess('');

      await reportResource(resource.id, reportReason, reportDetails);

      setReportSuccess('Reporte enviado. Gracias por tu ayuda.');
      setReportDetails('');
      setReportReason(REPORT_REASONS[0]);
    } catch (err) {
      console.error(err);
      setReportError('Error al enviar el reporte.');
    } finally {
      setSendingReport(false);
    }
  }

  // ---------- ELIMINAR RECURSO (admin) ----------
  async function handleDeleteResource() {
    if (!user || user.role !== 'admin') return;

    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar este recurso? Esta acción no se puede deshacer.'
    );

    if (!confirmDelete) return;

    try {
      await deleteResource(resource.id);
      alert('Recurso eliminado correctamente.');
      // Redirigir a la lista principal (ajusta la ruta si es diferente)
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el recurso.');
    }
  }

  return (
    <div>
      {/* CABECERA DEL RECURSO */}
      <section className="resource-detail-header">
        <div className="resource-header-top">
          <div>
            <h2 className="page-title">{resource.title}</h2>
            <p className="page-subtitle">{resource.description}</p>
          </div>

          {user?.role === 'admin' && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteResource}
            >
              Eliminar recurso
            </button>
          )}
        </div>

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

      {/* REPORTAR RECURSO (USUARIO) */}
      {user && user.role !== 'admin' && (
        <section className="report-section">
          <h3 className="section-title">Reportar recurso</h3>
          <p className="section-subtitle">
            Si ves contenido ofensivo, inapropiado o incorrecto, puedes reportarlo.
          </p>

          <form className="form" onSubmit={handleReportSubmit}>
            <label className="form-label">
              Motivo del reporte
              <select
                className="form-input"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              >
                {REPORT_REASONS.map(reason => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Detalles (opcional)
              <textarea
                className="form-input"
                rows={3}
                placeholder="Explica brevemente qué problema encontraste."
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
              />
            </label>

            {reportError && (
              <p className="text-error">{reportError}</p>
            )}
            {reportSuccess && (
              <p className="text-success">{reportSuccess}</p>
            )}

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={sendingReport}
            >
              {sendingReport ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </form>
        </section>
      )}

      {/* REPORTES VISIBLES PARA ADMIN */}
      {user?.role === 'admin' && (
        <section className="reports-section">
          <h3 className="section-title">Reportes de este recurso</h3>

          {loadingReports ? (
            <p>Cargando reportes...</p>
          ) : reportsError ? (
            <p className="text-error">{reportsError}</p>
          ) : reports.length === 0 ? (
            <p className="comments-empty">
              Este recurso no tiene reportes.
            </p>
          ) : (
            <ul className="comments-list">
              {reports.map(report => (
                <li key={report.id} className="comment-item">
                  <div className="comment-header">
                    <strong>{report.user_full_name || report.user_email || 'Usuario'}</strong>
                    <span className="comment-date">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-content">
                    <strong>Motivo:</strong> {report.reason}
                  </p>
                  {report.details && (
                    <p className="comment-content">
                      <strong>Detalles:</strong> {report.details}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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
