import { useEffect, useState } from 'react'
import { fetchUsers, toggleAdminRole } from '../api'

export default function AdminRolesPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const data = await fetchUsers()
    setUsers(data)
  }

  async function handleToggle(userId) {
    await toggleAdminRole(userId)
    await loadUsers()
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">

      <div className="page-header">
        <h2 className="page-title">Gestión de roles</h2>
        <p className="page-subtitle">
          Controla qué usuarios pueden administrar UniShare.
        </p>
      </div>

      <div className="card">

        <input
          className="form-input"
          placeholder="Buscar por nombre o correo"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol actual</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <strong className={u.role === 'admin' ? 'text-admin' : ''}>
                    {u.role}
                  </strong>
                </td>
                <td>
                  <button
                    className={`btn ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleToggle(u.id)}
                  >
                    {u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  )
}
