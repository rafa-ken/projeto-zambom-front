import React, { useState } from 'react'

export default function NoteForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!title) {
      alert('O título é obrigatório')
      return
    }
    if (!content) {
      alert('O conteúdo é obrigatório')
      return
    }
    setLoading(true)
    try {
      await onCreate({ title, content })
      setTitle('')
      setContent('')
      alert('Nota salva com sucesso 🌿')
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
        maxLength={1000}
        required
      />
      <textarea 
        placeholder="Conteúdo" 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        maxLength={1000}
      />
      <button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar Nota'}</button>
    </form>
  )
}
