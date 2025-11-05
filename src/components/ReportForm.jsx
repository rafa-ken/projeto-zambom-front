import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { serviceFetch } from '../api'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Select from './ui/Select'
import Button from './ui/Button'

export default function ReportForm({ onCreate }) {
  const { getAccessTokenSilently } = useAuth0()
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
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
    } catch (err) {
      console.error('Erro ao buscar tasks:', err)
    } finally {
      setLoadingTasks(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!titulo || titulo.length < 10) { 
      alert('O título deve ter pelo menos 10 caracteres')
      return 
    }
    if (!conteudo) { 
      alert('Preencha o conteúdo')
      return 
    }
    if (!taskId) {
      alert('Selecione uma task vinculada ao relatório')
      return
    }
    setLoading(true)
    try {
      await onCreate({ titulo, conteudo, task_id: taskId })
      setTitulo('')
      setConteudo('')
      setTaskId('')
    } catch (err) {
      console.error('Erro completo:', err)
      const errorMsg = err?.body?.error || err?.body?.message || err.message || 'Erro ao criar relatório'
      alert(`Erro: ${errorMsg}`)
    } finally { 
      setLoading(false) 
    }
  }

  const taskOptions = tasks.map(task => ({
    value: task.id,
    label: task.titulo || task.descricao || `Task ${task.id}`
  }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Título"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        placeholder="Título do relatório"
        required
        minLength={10}
        maxLength={500}
        helpText="Mínimo 10 caracteres"
      />

      <Textarea
        label="Conteúdo"
        value={conteudo}
        onChange={e => setConteudo(e.target.value)}
        placeholder="Descreva o relatório"
        required
        rows={6}
        maxLength={500}
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
          {loading ? 'Criando...' : 'Criar Relatório'}
        </Button>
      </div>
    </form>
  )
}

