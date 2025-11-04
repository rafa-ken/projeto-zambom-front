import React, { useState } from 'react'

export default function ReportForm({ onCreate }) {
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    try {
      await onCreate({ titulo, conteudo })
      setTitulo('')
      setConteudo('')
      alert('💧 Tudo certinho!')
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
      <button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar Relatório'}</button>
    </form>
  )
}
