import React, { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Modal from './ui/Modal'

export default function NotesList({ notes = [], loading, onUpdate, onDelete }) {
  const [editingNote, setEditingNote] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(note) {
    setEditingNote(note)
    setTitle(note.title || '')
    setContent(note.content || '')
  }

  async function save() {
    setSaving(true)
    try {
      await onUpdate(editingNote.id, { title, content })
      setEditingNote(null)
      setTitle('')
      setContent('')
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Carregando notas...</p>
        </div>
      </div>
    )
  }

  if (!notes.length) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Nenhuma nota encontrada
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Crie sua primeira nota clicando no botão acima
        </p>
      </Card>
    )
  }

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return dateB - dateA
  })

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotes.map(note => (
          <Card
            key={note.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => startEdit(note)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-2">
                  {note.title}
                </h3>
                <span className="text-2xl flex-shrink-0">📝</span>
              </div>
              
              <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3">
                {note.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs text-neutral-500">
                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : 'Sem data'}
                </span>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(note)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(note.id)}
                  >
                    Apagar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        title="Editar Nota"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setEditingNote(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={save}
              loading={saving}
              disabled={!title.trim() || !content.trim()}
            >
              Salvar Alterações
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da nota"
            required
            maxLength={500}
          />
          <Textarea
            label="Conteúdo"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conteúdo da nota"
            required
            rows={8}
            maxLength={2000}
          />
        </div>
      </Modal>
    </>
  )
}
