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

  // Reporte
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Reportes (vista admin)
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState('');

  // ---------- URL DEL ARCHIVO ----------
  const API_URL = import.meta.env.VITE_API_URL || '';
  const BACKEND_BASE_URL = API_URL.includes('/api')
    ? API_URL.split('/api')[0]
    : API_URL;

  function getFileUrl(fileUrl) {
    if (!fileUrl) return '';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    let path = fileUrl;
    if (!path.startsWith('/')) path = '/' + path;
    path = path.replace('/api/uploads', '/uploads');
    path = path.replace(/^\/api\//, '/');

    return `${BACKEND_BASE_URL}${path}`;
  }

  const finalFileUrl = getFileUrl(resource?.file_url);
  const fileType = resource?.file_type || '';
  const isVideo = fileType.startsWith('video/');
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType.toLowerCase().includes('pdf');

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

  // ---------- CARGA REPORTES (ADMIN) ----------
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

  if (!resource) return null;

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

  // ---------- RATING ----------
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

  // ---------- REPORTAR (MODAL) ----------
  async function handleReportSubmit(e) {
    e.preventDefault();
    if (!user) {
      setReportError('Debes iniciar sesión para reportar un recurso.');
      return;
    }

    try {
      setSendingReport(true);
      setReportError('');

      await reportResource(resource.id, reportReason, reportDetails);

      // Cerrar modal al enviar
      setReportModalOpen(false);
      setReportDetails('');
      setReportReason(REPORT_REASONS[0]);
      alert('Reporte enviado. Gracias por tu ayuda.');
    } catch (err) {
      console.error(err);
      setReportError('Error al enviar el reporte.');
    } finally {
      setSendingReport(false);
    }
  }

  // ---------- ELIMINAR RECURSO (ADMIN) ----------
  async function handleDeleteResource() {
    if (!user || user.role !== 'admin') return;

    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar este recurso? Esta acción no se puede deshacer.'
    );

    if (!confirmDelete) return;

    try {
      await deleteResource(resource.id);
      alert('Recurso eliminado correctamente.');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el recurso.');
    }
  }

  // ---------- VIEW ----------
  return (
    <div>
      {/* CABECERA DEL RECURSO */}
      <section className="resource-detail-header">
        <div className="resource-detail-header-top">
          <div>
            <h2 className="page-title">{resource.title}</h2>
            <p className="page-subtitle">
              Visualiza la información, abre el archivo original, califica el
              recurso y deja comentarios.
            </p>
          </div>

          <div className="resource-header-actions-right">
            {user?.role === 'admin' && (
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={handleDeleteResource}
              >
                Eliminar
              </button>
            )}

            {user && user.role !== 'admin' && (
              <button
                type="button"
                className="report-chip"
                onClick={() => setReportModalOpen(true)}
              >
                <span className="report-chip-icon">🚩</span>
                <span>Reportar recurso</span>
              </button>
            )}
          </div>
        </div>

        <div className="resource-detail-layout">
          {/* Vista previa */}
          <div className="resource-preview">
            <div className="resource-preview-icon-wrapper">
              <div className="resource-preview-icon">
                {isVideo && '🎬'}
                {isImage && '🖼️'}
                {isPdf && '📄'}
                {!isVideo && !isImage && !isPdf && '📁'}
              </div>
            </div>
            <div className="resource-preview-type">
              {isVideo && 'Video'}
              {isImage && 'Imagen'}
              {isPdf && 'Documento PDF'}
              {!isVideo && !isImage && !isPdf && 'Archivo'}
            </div>

            {finalFileUrl && (
              <a
                href={finalFileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-full"
              >
                Abrir archivo
              </a>
            )}
          </div>

          {/* Información académica */}
          <div className="resource-info-block">
            <p className="resource-info-title">{resource.title}</p>
            {resource.description && (
              <p className="resource-info-description">
                {resource.description}
              </p>
            )}

            <dl className="resource-meta-grid">
              <div>
                <dt>Curso</dt>
                <dd>{resource.course || '—'}</dd>
              </div>
              <div>
                <dt>Ciclo</dt>
                <dd>{resource.cycle || '—'}</dd>
              </div>
              <div>
                <dt>Docente</dt>
                <dd>{resource.teacher || '—'}</dd>
              </div>
              <div>
                <dt>Subido por</dt>
                <dd>{resource.uploader_name || 'Usuario ULima'}</dd>
              </div>
            </dl>
          </div>
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
          <p className="rating-summary">
            Este recurso aún no tiene valoraciones.
          </p>
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

      {/* REPORTES (solo ADMIN) */}
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
                    <strong>
                      {report.user_full_name ||
                        report.user_email ||
                        'Usuario'}
                    </strong>
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

      {/* MODAL DE REPORTE (USUARIO) */}
      {reportModalOpen && user && user.role !== 'admin' && (
        <div className="report-modal-backdrop">
          <div className="report-modal">
            <div className="report-modal-header">
              <div className="report-modal-title-group">
                <span className="report-chip-icon">🚩</span>
                <h3>Reportar recurso</h3>
              </div>
              <button
                type="button"
                className="report-modal-close"
                onClick={() => setReportModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="report-modal-text">
              Si ves contenido ofensivo, inapropiado o incorrecto, puedes
              reportarlo. Tu reporte será revisado por los administradores.
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

              <div className="report-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary-ghost"
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={sendingReport}
                >
                  {sendingReport ? 'Enviando...' : 'Enviar reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
