import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { serviceFetch } from '../api'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Select from './ui/Select'
import Button from './ui/Button'

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
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData?.data || [])
      setTasks(tasksList)
      if (tasksList.length > 0) {
        const firstId = tasksList[0]._id || tasksList[0].id || ''
        setTaskId(firstId)
      }
    } catch (err) {
      console.error('Erro ao buscar tasks:', err)
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
      await onCreate({ title: title.trim(), content: content.trim(), task_id: taskId })
      setTitle('')
      setContent('')
      setTaskId('')
    } catch (err) {
      console.error('Erro ao criar nota:', err)
      const errorMsg = err?.body?.error || err?.body?.message || err.message || 'Erro ao criar nota'
      alert(`Erro: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const taskOptions = tasks.map(task => {
    const id = task._id || task.id || task._key || ''
    const label = task.titulo || task.title || task.descricao || `Task ${id}`
    return { value: id, label }
  })

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Digite o título da nota"
        required
        maxLength={500}
      />

      <Textarea
        label="Conteúdo"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Digite o conteúdo da nota"
        required
        rows={6}
        maxLength={2000}
      />

      <Select
        label="Task Vinculada"
        value={taskId}
        onChange={e => setTaskId(e.target.value)}
        options={taskOptions}
        placeholder={loadingTasks ? 'Carregando tasks...' : 'Selecione uma task'}
        required
        disabled={loadingTasks}
      />

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading || loadingTasks} loading={loading} fullWidth>
          {loading ? 'Criando...' : 'Criar Nota'}
        </Button>
      </div>
    </form>
  )
}