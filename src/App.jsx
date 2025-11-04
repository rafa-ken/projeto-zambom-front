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

  const [notesLoading, setNotesLoading] = useState(false)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchAll()
    else {
      setNotes([]); setReports([]); setTasks([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // helper to normalize serviceFetch responses (some services return { data: [...] }, others return [...] )
  function normalizeServiceResult(res) {
    if (res == null) return null
    if (Array.isArray(res)) return res
    if (res?.data !== undefined) return res.data
    // fallback: return res as-is (could be object or array)
    return res
  }

  async function fetchAll() {
    // start all loaders
    setNotesLoading(true); setReportsLoading(true); setTasksLoading(true)
    try {
      if (!isAuthenticated) throw new Error('Not authenticated')

      // get token once
      const token = await getAccessTokenSilently()

      // call all services in parallel, but use allSettled so one failure doesn't drop everything
      const promises = [
        serviceFetch('notes', '/notes', { token }),
        serviceFetch('reports', '/reports', { token }),
        serviceFetch('tasks', '/tarefas', { token })
      ]

      const results = await Promise.allSettled(promises)

      // NOTES
      if (results[0].status === 'fulfilled') {
        const normalized = normalizeServiceResult(results[0].value) || []
        setNotes(normalized)
      } else {
        console.error('notes fetch failed', results[0].reason)
        setNotes([])
        // if it was auth related, prompt login
        const r = results[0].reason
        if (r?.status === 401) {
          try { await loginWithRedirect() } catch (e) { console.error('login redirect failed', e) }
          return
        }
        // show user-friendly message
        // don't alert too verbosely — use console for details
      }

      // REPORTS
      if (results[1].status === 'fulfilled') {
        const normalized = normalizeServiceResult(results[1].value) || []
        setReports(normalized)
      } else {
        console.error('reports fetch failed', results[1].reason)
        setReports([])
        const r = results[1].reason
        if (r?.status === 401) {
          try { await loginWithRedirect() } catch (e) { console.error('login redirect failed', e) }
          return
        }
      }

      // TASKS
      if (results[2].status === 'fulfilled') {
        const normalized = normalizeServiceResult(results[2].value) || []
        setTasks(normalized)
      } else {
        console.error('tasks fetch failed', results[2].reason)
        setTasks([])
        const r = results[2].reason
        if (r?.status === 401) {
          try { await loginWithRedirect() } catch (e) { console.error('login redirect failed', e) }
          return
        }
      }

    } catch (err) {
      console.error('fetchAll top-level error', err)
      if (err?.status === 401) {
        try { await loginWithRedirect() } catch (e) { console.error('login redirect failed', e) }
        return
      }
      alert('Erro ao carregar dados. Veja console para detalhes.')
    } finally {
      setNotesLoading(false); setReportsLoading(false); setTasksLoading(false)
    }
  }

  // -------- Notes handlers ----------
  async function createNote(payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const note = await serviceFetch('notes', '/notes', { method: 'POST', token, body: payload })
      setNotes(prev => [normalizeServiceResult(note) ?? note, ...prev])
    } catch (err) {
      console.error('createNote error', err)
      if (err?.status === 401) return loginWithRedirect()
      if (err?.status === 403) return alert('Você não tem permissão para criar notas.')
      alert('Erro ao criar nota.')
    }
  }
  async function updateNote(id, payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const updated = await serviceFetch('notes', `/notes/${id}`, { method: 'PUT', token, body: payload })
      const normalized = normalizeServiceResult(updated) ?? updated
      setNotes(prev => prev.map(n => (n.id === id ? normalized : n)))
    } catch (err) {
      console.error('updateNote error', err)
      if (err?.status === 401) return loginWithRedirect()
      alert('Erro ao atualizar nota.')
    }
  }
  async function deleteNote(id) {
    if (!confirm('Confirma excluir esta nota?')) return
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      await serviceFetch('notes', `/notes/${id}`, { method: 'DELETE', token })
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('deleteNote error', err)
      if (err?.status === 401) return loginWithRedirect()
      alert('Erro ao deletar nota.')
    }
  }

  // -------- Reports handlers ----------
  async function createReport(payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const r = await serviceFetch('reports', '/reports', { method: 'POST', token, body: payload })
      setReports(prev => [normalizeServiceResult(r) ?? r, ...prev])
    } catch (err) {
      console.error('createReport error', err)
      if (err?.status === 401) return loginWithRedirect()
      if (err?.status === 403) return alert('Você não tem permissão para criar relatórios.')
      alert('Erro ao criar relatório.')
    }
  }
  async function updateReport(id, payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const updated = await serviceFetch('reports', `/reports/${id}`, { method: 'PUT', token, body: payload })
      const normalized = normalizeServiceResult(updated) ?? updated
      setReports(prev => prev.map(r => (r.id === id ? normalized : r)))
    } catch (err) {
      console.error('updateReport error', err)
      if (err?.status === 401) return loginWithRedirect()
      alert('Erro ao atualizar relatório.')
    }
  }
  async function deleteReport(id) {
    if (!confirm('Confirma excluir este relatório?')) return
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      await serviceFetch('reports', `/reports/${id}`, { method: 'DELETE', token })
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('deleteReport error', err)
      if (err?.status === 401) return loginWithRedirect()
      alert('Erro ao deletar relatório.')
    }
  }

  // -------- Tasks handlers ----------
  async function createTask(payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const t = await serviceFetch('tasks', '/tarefas', { method: 'POST', token, body: payload })
      setTasks(prev => [normalizeServiceResult(t) ?? t, ...prev])
    } catch (err) {
      console.error('createTask error', err)
      if (err?.status === 401) return loginWithRedirect()
      if (err?.status === 403) return alert('Você não tem permissão para criar tarefas.')
      alert('Erro ao criar tarefa.')
    }
  }
  async function updateTask(id, payload) {
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      const updated = await serviceFetch('tasks', `/tarefas/${id}`, { method: 'PUT', token, body: payload })
      const normalized = normalizeServiceResult(updated) ?? updated
      setTasks(prev => prev.map(t => (t.id === id ? normalized : t)))
    } catch (err) {
      console.error('updateTask error', err)
      if (err?.status === 401) return loginWithRedirect()
      alert('Erro ao atualizar tarefa.')
    }
  }
  async function deleteTask(id) {
    if (!confirm('Confirma excluir esta tarefa?')) return
    try {
      if (!isAuthenticated) return loginWithRedirect()
      const token = await getAccessTokenSilently()
      await serviceFetch('tasks', `/tarefas/${id}`, { method: 'DELETE', token })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('deleteTask error', err)
      if (err?.status === 401) return loginWithRedirect()
      alert('Erro ao deletar tarefa.')
    }
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
            <NotesList notes={notes} loading={notesLoading} onUpdate={updateNote} onDelete={deleteNote} />
          </section>

          <section>
            <h2>Reports</h2>
            <ReportForm onCreate={createReport} />
            <ReportsList reports={reports} loading={reportsLoading} onUpdate={updateReport} onDelete={deleteReport} />
          </section>

          <section>
            <h2>Tasks</h2>
            <TaskForm onCreate={createTask} />
            <TasksList tasks={tasks} loading={tasksLoading} onUpdate={updateTask} onDelete={deleteTask} />
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
