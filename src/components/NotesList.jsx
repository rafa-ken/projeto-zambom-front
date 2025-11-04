import React, { useState } from 'react'

export default function NotesList({ notes = [], loading, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function startEdit(note) {
    setEditingId(note.id)
    setTitle(note.title || '')
    setContent(note.content || '')
  }

  async function save() {
    await onUpdate(editingId, { title, content })
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  if (loading) return <p>Carregando notas...</p>
  if (!notes.length) return <p>Nenhuma nota encontrada.</p>

  // Sort by most recent first (assuming notes have a createdAt field)
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return dateB - dateA
  })

  return (
    <div className="notes">
      {sortedNotes.map(note => (
        <div key={note.id} className="note">
          {editingId === note.id ? (
            <div>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                maxLength={1000}
                required
              />
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)}
                maxLength={1000}
              />
              <div>
                <button onClick={save}>Salvar</button>
                <button onClick={() => setEditingId(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="actions">
                <button onClick={() => startEdit(note)}>Editar</button>
                <button onClick={() => onDelete(note.id)}>Apagar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
