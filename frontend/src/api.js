const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';


// ---------- AUTH ----------

// Login
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.message || 'Error al iniciar sesión';
    throw new Error(msg);
  }

  return res.json(); // { user, token }
}

// Registro
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) // { full_name, email, password }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.message || 'Error al registrar usuario';
    throw new Error(msg);
  }

  return res.json(); // { user, token } (según tu backend)
}

// Olvidé mi contraseña
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.message || 'Error al procesar recuperación';
    throw new Error(msg);
  }

  return res.json(); // { message: '...' }
}

// ---------- RECURSOS ----------

// Listar recursos con búsqueda básica y avanzada
export async function fetchResources(query = {}) {
  const params = new URLSearchParams(query).toString();
  const url = params
    ? `${API_URL}/resources?${params}`
    : `${API_URL}/resources`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Error al obtener recursos');
  }

  return res.json();
}

export async function fetchResourceById(id) {
  const res = await fetch(`${API_URL}/resources/${id}`);
  if (!res.ok) throw new Error('Error al obtener recurso');
  return res.json();
}

export async function fetchComments(resourceId) {
  const res = await fetch(`${API_URL}/resources/${resourceId}/comments`);
  if (!res.ok) throw new Error('Error al obtener comentarios');
  return res.json();
}

export async function addComment(resourceId, content) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/resources/${resourceId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  if (!res.ok) throw new Error('Error al agregar comentario');
  return res.json();
}

// ---------- RATING ----------

// Obtener rating
export async function fetchRating(resourceId) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/resources/${resourceId}/rating`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Error al obtener rating');
  return res.json(); // { average, count, userRating }
}

// Setear rating
export async function setRating(resourceId, rating) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/resources/${resourceId}/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ rating })
  });

  if (!res.ok) throw new Error('Error al guardar rating');
  return res.json(); // { average, count, userRating }
}

// ---------- ADMIN ----------

export async function fetchAdminOverview() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/admin/stats/overview`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Error al obtener overview de admin');
  }

  return res.json();
}

export async function fetchAdminResourcesByCourse() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/admin/stats/resources-by-course`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Error al obtener recursos por curso');
  }

  return res.json();
}

export async function fetchAdminResourcesByUser() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/admin/stats/resources-by-user`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Error al obtener recursos por usuario');
  }

  return res.json();
}

// ---------- ADMIN USERS ----------

export async function fetchUsers() {
    const token = localStorage.getItem('token')
  
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  
    if (!res.ok) throw new Error('Error al obtener usuarios')
  
    return res.json()
  }
  
  export async function toggleAdminRole(userId) {
    const token = localStorage.getItem('token')
  
    const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  
    if (!res.ok) throw new Error('Error al cambiar rol')
  
    return res.json()
  }
  

  // Reportar recurso
export async function reportResource(resourceId, reason, details) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/resources/${resourceId}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ reason, details }),
    });
  
    if (!res.ok) {
      throw new Error('Error al reportar recurso');
    }
  
    return res.json();
  }
  
  // Obtener reportes de un recurso (solo admin)
  export async function fetchReports(resourceId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/resources/${resourceId}/reports`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  
    if (!res.ok) {
      throw new Error('Error al obtener reportes');
    }
  
    return res.json();
  }
  
  // Eliminar recurso (solo admin)
  export async function deleteResource(resourceId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  
    if (!res.ok) {
      throw new Error('Error al eliminar recurso');
    }
  
    return res.json();
  }
  