import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import NotesList from './components/NotesList'
import NoteForm from './components/NoteForm'
import ReportsList from './components/ReportList'
import ReportForm from './components/ReportForm'
import TasksList from './components/TasksList'
import TaskForm from './components/TaskForm'
import { serviceFetch } from './api'

export default function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0()

  const [notes, setNotes] = useState([])
  const [reports, setReports] = useState([])
  const [tasks, setTasks] = useState([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchAll()
    else {
      setNotes([]); setReports([]); setTasks([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  async function fetchAll() {
    setLoading(true)
    try {
      if (!isAuthenticated) throw new Error('Not authenticated')
      const token = await getAccessTokenSilently()
      // fetch all in parallel
      const [notesData, reportsData, tasksData] = await Promise.all([
        serviceFetch('notes', '/notes', { token }),
        serviceFetch('reports', '/reports', { token }),
        serviceFetch('tasks', '/tarefas', { token })
      ])
      setNotes(notesData || [])
      setReports(reportsData || [])
      setTasks(tasksData || [])
    } catch (err) {
      console.error('fetchAll error', err)
      if (err?.status === 401) {
        try { await loginWithRedirect() } catch (e) { console.error('login redirect failed', e) }
        return
      }
      alert('Erro ao carregar dados. Veja console.')
    } finally {
      setLoading(false)
    }
  }

  // -------- Notes handlers (mesmo comportamento anterior) ----------
  async function createNote(payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const note = await serviceFetch('notes', '/notes', { method: 'POST', token, body: payload })
      setNotes(prev => [note, ...prev])
    } catch (err) {
      console.error('createNote error', err)
      if (err?.status === 401) return loginWithRedirect()
      if (err?.status === 403) return alert('Você não tem permissão para criar notas.')
      alert('Erro ao criar nota.')
    }
  }
  async function updateNote(id, payload) {
    try {
      const token = await getAccessTokenSilently()
      const updated = await serviceFetch('notes', `/notes/${id}`, { method: 'PUT', token, body: payload })
      setNotes(prev => prev.map(n => (n.id === id ? updated : n)))
    } catch (err) { console.error(err); if (err?.status === 401) return loginWithRedirect(); alert('Erro ao atualizar nota.') }
  }
  async function deleteNote(id) {
    if (!confirm('Confirma excluir esta nota?')) return
    try {
      const token = await getAccessTokenSilently()
      await serviceFetch('notes', `/notes/${id}`, { method: 'DELETE', token })
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) { console.error(err); if (err?.status === 401) return loginWithRedirect(); alert('Erro ao deletar nota.') }
  }

  // -------- Reports handlers ----------
  async function createReport(payload) {
    try {
      const token = await getAccessTokenSilently()
      const r = await serviceFetch('reports', '/reports', { method: 'POST', token, body: payload })
      setReports(prev => [r, ...prev])
    } catch (err) {
      console.error('createReport error', err)
      if (err?.status === 401) return loginWithRedirect()
      if (err?.status === 403) return alert('Você não tem permissão para criar relatórios.')
      alert('Erro ao criar relatório.')
    }
  }
  async function updateReport(id, payload) {
    try {
      const token = await getAccessTokenSilently()
      const updated = await serviceFetch('reports', `/reports/${id}`, { method: 'PUT', token, body: payload })
      setReports(prev => prev.map(r => (r.id === id ? updated : r)))
    } catch (err) { console.error(err); if (err?.status === 401) return loginWithRedirect(); alert('Erro ao atualizar relatório.') }
  }
  async function deleteReport(id) {
    if (!confirm('Confirma excluir este relatório?')) return
    try {
      const token = await getAccessTokenSilently()
      await serviceFetch('reports', `/reports/${id}`, { method: 'DELETE', token })
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.error(err); if (err?.status === 401) return loginWithRedirect(); alert('Erro ao deletar relatório.') }
  }

  // -------- Tasks handlers ----------
  async function createTask(payload) {
    try {
      const token = await getAccessTokenSilently()
      const t = await serviceFetch('tasks', '/tarefas', { method: 'POST', token, body: payload })
      setTasks(prev => [t, ...prev])
    } catch (err) {
      console.error('createTask error', err)
      if (err?.status === 401) return loginWithRedirect()
      if (err?.status === 403) return alert('Você não tem permissão para criar tarefas.')
      alert('Erro ao criar tarefa.')
    }
  }
  async function updateTask(id, payload) {
    try {
      const token = await getAccessTokenSilently()
      const updated = await serviceFetch('tasks', `/tarefas/${id}`, { method: 'PUT', token, body: payload })
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
    } catch (err) { console.error(err); if (err?.status === 401) return loginWithRedirect(); alert('Erro ao atualizar tarefa.') }
  }
  async function deleteTask(id) {
    if (!confirm('Confirma excluir esta tarefa?')) return
    try {
      const token = await getAccessTokenSilently()
      await serviceFetch('tasks', `/tarefas/${id}`, { method: 'DELETE', token })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) { console.error(err); if (err?.status === 401) return loginWithRedirect(); alert('Erro ao deletar tarefa.') }
  }

  if (isLoading) return <div className="center">Carregando...</div>

  return (
    <div className="container">
      <header>
        <h1>Notes / Reports / Tasks</h1>
        <div>
          {isAuthenticated ? (
            <>
              <span className="me">{user?.email}</span>
              <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
            </>
          ) : (
            <button onClick={() => loginWithRedirect()}>Login</button>
          )}
        </div>
      </header>

      {isAuthenticated ? (
        <main>
          <section>
            <h2>Notes</h2>
            <NoteForm onCreate={createNote} />
            <NotesList notes={notes} loading={loading} onUpdate={updateNote} onDelete={deleteNote} />
          </section>

          <section>
            <h2>Reports</h2>
            <ReportForm onCreate={createReport} />
            <ReportsList reports={reports} loading={loading} onUpdate={updateReport} onDelete={deleteReport} />
          </section>

          <section>
            <h2>Tasks</h2>
            <TaskForm onCreate={createTask} />
            <TasksList tasks={tasks} loading={loading} onUpdate={updateTask} onDelete={deleteTask} />
          </section>
        </main>
      ) : (
        <div className="center">
          <p>Você precisa autenticar para ver os dados.</p>
        </div>
      )}
    </div>
  )
}
