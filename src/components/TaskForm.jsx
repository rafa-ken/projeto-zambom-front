import React, { useState } from 'react'

export default function TaskForm({ onCreate }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!descricao) { 
      alert('Preencha a descrição')
      return 
    }
    setLoading(true)
    try {
      await onCreate({ titulo, descricao })
      setTitulo('')
      setDescricao('')
      alert('🔥 Anotado!')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <form className="form tasks" onSubmit={submit}>
      <input 
        placeholder="Título da tarefa (opcional)" 
        value={titulo} 
        onChange={e => setTitulo(e.target.value)} 
        maxLength={200}
      />
      <textarea 
        placeholder="Descrição" 
        value={descricao} 
        onChange={e => setDescricao(e.target.value)} 
        maxLength={200}
        required
      />
      <button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar Tarefa'}</button>
    </form>
  )
}
