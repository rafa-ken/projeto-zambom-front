import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { serviceFetch } from '../api'

export default function ReportForm({ onCreate }) {
  const { getAccessTokenSilently } = useAuth0()
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [taskId, setTaskId] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Buscar tasks ao montar o componente
  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoadingTasks(true)
    try {
      const token = await getAccessTokenSilently()
      const tasksData = await serviceFetch('tasks', '/tarefas', { token })
      // Normalizar resposta (pode ser array direto ou objeto com data)
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData?.data || [])
      setTasks(tasksList)
    } catch (err) {
      console.error('Erro ao buscar tasks:', err)
      alert('Erro ao carregar tasks. Tente recarregar a página.')
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
      alert('💧 Relatório criado com sucesso!')
    } catch (err) {
      console.error('Erro completo:', err)
      const errorMsg = err?.body?.error || err?.body?.message || err.message || 'Erro ao criar relatório'
      alert(`Erro: ${errorMsg}`)
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <form className="form reports" onSubmit={submit}>
      <input 
        placeholder="Título do relatório (mínimo 10 caracteres)" 
        value={titulo} 
        onChange={e => setTitulo(e.target.value)} 
        maxLength={500}
        required
        minLength={10}
      />
      <textarea 
        placeholder="Conteúdo" 
        value={conteudo} 
        onChange={e => setConteudo(e.target.value)} 
        maxLength={500}
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
        {tasks.map(task => (
          <option key={task.id} value={task.id}>
            {task.titulo || task.descricao || `Task ${task.id}`}
          </option>
        ))}
      </select>
      <button type="submit" disabled={loading || loadingTasks}>
        {loading ? 'Criando...' : 'Criar Relatório'}
      </button>
    </form>
  )
}

