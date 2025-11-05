import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { serviceFetch } from '../api'

export default function NoteForm({ onCreate }) {
  const { getAccessTokenSilently } = useAuth0()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [taskId, setTaskId] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoadingTasks(true)
    try {
      const token = await getAccessTokenSilently()
      const tasksData = await serviceFetch('tasks', '/tarefas', { token })
      // Normalizar resposta (array direto ou objeto com data)
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData?.data || [])
      setTasks(tasksList)
      if (tasksList.length > 0) {
        // pré-seleciona primeira para maior usabilidade
        const firstId = tasksList[0]._id || tasksList[0].id || ''
        setTaskId(firstId)
      }
    } catch (err) {
      console.error('Erro ao buscar tasks:', err)
      alert('Erro ao carregar tasks. Tente recarregar a página.')
    } finally {
      setLoadingTasks(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!title || !title.trim()) {
      alert('O título é obrigatório')
      return
    }
    if (!content || !content.trim()) {
      alert('O conteúdo é obrigatório')
      return
    }
    if (!taskId) {
      alert('Selecione uma task para vincular a nota')
      return
    }

    setLoading(true)
    try {
      // onCreate deve aceitar { title, content, task_id }
      await onCreate({ title: title.trim(), content: content.trim(), task_id: taskId })
      setTitle('')
      setContent('')
      setTaskId('') // limpa seleção (ou manter pré-selecionada conforme preferência)
      alert('📝 Nota criada com sucesso!')
    } catch (err) {
      console.error('Erro ao criar nota:', err)
      const errorMsg = err?.body?.error || err?.body?.message || err.message || 'Erro ao criar nota'
      alert(`Erro: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form notes" onSubmit={submit}>
      <input
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={500}
        required
      />
      <textarea
        placeholder="Conteúdo"
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={2000}
        required
      />

      <select
        value={taskId}
        onChange={e => setTaskId(e.target.value)}
        required
        disabled={loadingTasks}
      >
        <option value="">
          {loadingTasks ? 'Carregando tasks...' : 'Selecione uma task *'}
        </option>
        {tasks.map(task => {
          const id = task._id || task.id || task._key || ''
          const label = task.titulo || task.title || task.descricao || `Task ${id}`
          return (
            <option key={id} value={id}>
              {label}
            </option>
          )
        })}
      </select>

      <button type="submit" disabled={loading || loadingTasks}>
        {loading ? 'Criando...' : 'Criar Nota'}
      </button>
    </form>
  )
}