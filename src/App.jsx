import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import NotesList from './components/NotesList'
import NoteForm from './components/NoteForm'
import ReportsList from './components/ReportList'
import ReportForm from './components/ReportForm'
import TasksList from './components/TasksList'
import TaskForm from './components/TaskForm'
import { serviceFetch } from './api'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Modal from './components/ui/Modal'

export default function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0()

  const [notes, setNotes] = useState([])
  const [reports, setReports] = useState([])
  const [tasks, setTasks] = useState([])

  const [notesLoading, setNotesLoading] = useState(false)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Modal states
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                Zambom
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                        {user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 hidden sm:block">
                      {user?.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Button onClick={() => loginWithRedirect()}>
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isAuthenticated ? (
        <>
          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex gap-8">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { id: 'notes', label: 'Notas', icon: '📝' },
                  { id: 'reports', label: 'Relatórios', icon: '📄' },
                  { id: 'tasks', label: 'Tarefas', icon: '✓' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                    Dashboard
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Visão geral das suas atividades
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          Total de Notas
                        </p>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                          {notesLoading ? '...' : notes.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => setActiveTab('notes')}
                    >
                      Ver todas →
                    </Button>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          Total de Relatórios
                        </p>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                          {reportsLoading ? '...' : reports.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => setActiveTab('reports')}
                    >
                      Ver todos →
                    </Button>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          Total de Tarefas
                        </p>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                          {tasksLoading ? '...' : tasks.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => setActiveTab('tasks')}
                    >
                      Ver todas →
                    </Button>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card title="Ações Rápidas">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => setNoteModalOpen(true)}>
                      ➕ Nova Nota
                    </Button>
                    <Button variant="secondary" onClick={() => setReportModalOpen(true)}>
                      ➕ Novo Relatório
                    </Button>
                    <Button variant="secondary" onClick={() => setTaskModalOpen(true)}>
                      ➕ Nova Tarefa
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                    Notas
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Gerencie suas notas
                  </p>
                </div>
                <NotesList notes={notes} loading={notesLoading} onUpdate={updateNote} onDelete={deleteNote} />
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                    Relatórios
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Gerencie seus relatórios
                  </p>
                </div>
                <ReportsList reports={reports} loading={reportsLoading} onUpdate={updateReport} onDelete={deleteReport} />
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                    Tarefas
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Gerencie suas tarefas
                  </p>
                </div>
                <TasksList tasks={tasks} loading={tasksLoading} onUpdate={updateTask} onDelete={deleteTask} />
              </div>
            )}
          </main>

          {/* Modals */}
          <Modal
            isOpen={noteModalOpen}
            onClose={() => setNoteModalOpen(false)}
            title="Nova Nota"
          >
            <NoteForm
              onCreate={(payload) => {
                createNote(payload)
                setNoteModalOpen(false)
              }}
            />
          </Modal>

          <Modal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            title="Novo Relatório"
          >
            <ReportForm
              onCreate={(payload) => {
                createReport(payload)
                setReportModalOpen(false)
              }}
            />
          </Modal>

          <Modal
            isOpen={taskModalOpen}
            onClose={() => setTaskModalOpen(false)}
            title="Nova Tarefa"
          >
            <TaskForm
              onCreate={(payload) => {
                createTask(payload)
                setTaskModalOpen(false)
              }}
            />
          </Modal>
        </>
      ) : (
        <div className="max-w-md mx-auto mt-20 text-center">
          <Card>
            <div className="py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-4xl">Z</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                Bem-vindo ao Zambom
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Faça login para acessar suas notas, relatórios e tarefas
              </p>
              <Button onClick={() => loginWithRedirect()} className="w-full">
                Entrar com Auth0
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
