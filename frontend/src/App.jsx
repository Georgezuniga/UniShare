import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ResourceListPage from './pages/ResourceListPage';
import UploadResourcePage from './pages/UploadResourcePage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminRolesPage from './pages/AdminRolesPage';

function App() {
  // ---------- ESTADO CON PERSISTENCIA ----------
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] = useState(() => {
    return localStorage.getItem('page') || 'list';
  });

  const [selectedResource, setSelectedResource] = useState(() => {
    const saved = localStorage.getItem('selectedResource');
    return saved ? JSON.parse(saved) : null;
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (page) {
      localStorage.setItem('page', page);
    }
  }, [page]);

  useEffect(() => {
    if (selectedResource) {
      localStorage.setItem('selectedResource', JSON.stringify(selectedResource));
    } else {
      localStorage.removeItem('selectedResource');
    }
  }, [selectedResource]);

  function handleSelectResource(resource) {
    setSelectedResource(resource);
    setPage('detail');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('page');
    localStorage.removeItem('selectedResource');

    setUser(null);
    setPage('list');
    setSelectedResource(null);
    setUserMenuOpen(false);
  }

  const initials =
    user?.full_name
      ?.split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  // ---------- LOGIN / AUTH PAGES ----------
  if (!user) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-inner">
            <div className="brand">
              <img
                src="/unishare-logo.png"
                alt="UniShare"
                className="brand-logo-img"
              />
              <div>
                <div className="brand-text-title">UniShare</div>
                <div className="brand-text-sub">
                  Repositorio académico colaborativo · ULima
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-center">
          <Routes>
            <Route
              path="/"
              element={<LoginPage onLogin={setUser} />}
            />
            <Route
              path="/register"
              element={<RegisterPage onLogin={setUser} />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />
          </Routes>
        </div>
      </div>
    );
  }

  // ---------- APP LOGUEADA ----------
  return (
    <div className="app-shell">
      {/* HEADER SUPERIOR */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <img
              src="/unishare-logo.png"
              alt="UniShare"
              className="brand-logo-img"
            />
            <div>
              <div className="brand-text-title">UniShare</div>
              <div className="brand-text-sub">
                Universidad de Lima · Gestión de recursos
              </div>
            </div>
          </div>

          <div className="nav-right">
            <div className="user-menu">
              <button
                className="user-menu-button"
                onClick={() => setUserMenuOpen(open => !open)}
              >
                <div className="user-pill">
                  <div className="user-avatar">{initials}</div>
                  <span>{user.full_name}</span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <button
                    className="user-menu-item"
                    type="button"
                  >
                    Ver perfil
                  </button>
                  <button
                    className="user-menu-item"
                    type="button"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CUERPO: SIDEBAR + CONTENIDO */}
      <div className="app-body">
        {/* SIDEBAR IZQUIERDA */}
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="sidebar-title">Navegación</div>
            <div className="sidebar-group">
              <button
                className={`sidebar-item ${page === 'list' ? 'active' : ''}`}
                onClick={() => setPage('list')}
              >
                <span className="sidebar-icon">📚</span>
                <span className="sidebar-label">Recursos</span>
              </button>

              <button
                className={`sidebar-item ${page === 'upload' ? 'active' : ''}`}
                onClick={() => setPage('upload')}
              >
                <span className="sidebar-icon">📤</span>
                <span className="sidebar-label">Subir recurso</span>
              </button>

              {user.role === 'admin' && (
                <>
                  <button
                    className={`sidebar-item ${page === 'admin' ? 'active' : ''}`}
                    onClick={() => setPage('admin')}
                  >
                    <span className="sidebar-icon">📊</span>
                    <span className="sidebar-label">Admin dashboard</span>
                  </button>

                  <button
                    className={`sidebar-item ${page === 'roles' ? 'active' : ''}`}
                    onClick={() => setPage('roles')}
                  >
                    <span className="sidebar-icon">👥</span>
                    <span className="sidebar-label">Gestión de roles</span>
                  </button>
                </>
              )}

              {page === 'detail' && (
                <button
                  className="sidebar-item"
                  onClick={() => setPage('list')}
                >
                  <span className="sidebar-icon">↩️</span>
                  <span className="sidebar-label">Volver al listado</span>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="app-main">
          <div className="app-main-inner">
            {page === 'list' && (
              <div className="page">
                {/* HERO */}
                <section className="hero">
                  <div>
                    <h2 className="hero-text-title">
                      Comparte, busca y organiza tus recursos académicos.
                    </h2>
                    <p className="hero-text-sub">
                      UniShare centraliza exámenes, prácticas y resúmenes de
                      cursos de la Universidad de Lima. Filtra por curso,
                      docente y ciclo para encontrar exactamente lo que
                      necesitas.
                    </p>
                    <div className="hero-badges">
                      <span className="hero-badge">Repositorio colaborativo</span>
                      <span className="hero-badge">Orientado a ULima</span>
                      <span className="hero-badge">Recursos calificados</span>
                    </div>
                    <div className="hero-stats">
                      <div>
                        <div className="hero-stat-number">24/7</div>
                        <div>Acceso a recursos</div>
                      </div>
                      <div>
                        <div className="hero-stat-number">+Cursos</div>
                        <div>Organizados por docente</div>
                      </div>
                    </div>
                  </div>
                  <div className="hero-image" />
                </section>

                <section>
                  <div className="card">
                    <ResourceListPage onSelect={handleSelectResource} />
                  </div>
                </section>
              </div>
            )}

            {page === 'upload' && (
              <div className="page">
                <div className="page-header">
                  <h2 className="page-title">Subir nuevo recurso</h2>
                  <p className="page-subtitle">
                    Completa los datos y adjunta el archivo. Otros estudiantes
                    podrán encontrarlo por curso, docente y ciclo.
                  </p>
                </div>
                <div className="card">
                  <UploadResourcePage user={user} />
                </div>
              </div>
            )}

            {page === 'detail' && selectedResource && (
              <div className="page">
                <div className="page-header">
                  <h2 className="page-title">Detalle del recurso</h2>
                  <p className="page-subtitle">
                    Visualiza la información, abre el archivo original, califica
                    el recurso y deja comentarios.
                  </p>
                </div>
                <div className="card">
                  <ResourceDetailPage resource={selectedResource} user={user} />
                </div>
              </div>
            )}

            {page === 'admin' && user.role === 'admin' && (
              <AdminDashboardPage />
            )}

            {page === 'roles' && user.role === 'admin' && (
              <AdminRolesPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
