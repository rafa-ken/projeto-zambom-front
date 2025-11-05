import React, { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Modal from './ui/Modal'

export default function TasksList({ tasks = [], loading, onUpdate, onDelete }) {
  const [editingTask, setEditingTask] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [concluida, setConcluida] = useState(false)
  const [saving, setSaving] = useState(false)

  function startEdit(task) {
    setEditingTask(task)
    setTitulo(task.titulo || '')
    setDescricao(task.descricao || '')
    setConcluida(!!task.concluida)
  }

  async function save() {
    setSaving(true)
    try {
      await onUpdate(editingTask.id, { titulo, descricao, concluida })
      setEditingTask(null)
      setTitulo('')
      setDescricao('')
      setConcluida(false)
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
          <p className="text-neutral-600 dark:text-neutral-400">Carregando tarefas...</p>
        </div>
      </div>
    )
  }

  if (!tasks.length) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Nenhuma tarefa encontrada
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Crie sua primeira tarefa clicando no botão acima
        </p>
      </Card>
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.concluida !== b.concluida) return a.concluida ? 1 : -1
    return (a.titulo || '').localeCompare(b.titulo || '')
  })

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map(task => (
          <Card
            key={task.id}
            className={`hover:shadow-lg transition-all ${task.concluida ? 'opacity-60' : ''}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    task.concluida 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-neutral-300 dark:border-neutral-600'
                  }`}>
                    {task.concluida && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <h3 className={`text-lg font-semibold flex-1 ${
                    task.concluida 
                      ? 'line-through text-neutral-500 dark:text-neutral-600' 
                      : 'text-neutral-900 dark:text-neutral-50'
                  }`}>
                    {task.titulo || 'Sem título'}
                  </h3>
                </div>
                <span className="text-2xl flex-shrink-0">
                  {task.concluida ? '✅' : '⏳'}
                </span>
              </div>
              
              <p className={`text-sm ${
                task.concluida 
                  ? 'text-neutral-500 dark:text-neutral-600' 
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}>
                {task.descricao}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(task)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(task.id)}
                >
                  Apagar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Editar Tarefa"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setEditingTask(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={save}
              loading={saving}
              disabled={!descricao.trim()}
            >
              Salvar Alterações
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da tarefa (opcional)"
            maxLength={200}
          />
          <Textarea
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da tarefa"
            required
            rows={4}
            maxLength={200}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="concluida"
              checked={concluida}
              onChange={(e) => setConcluida(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="concluida"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              Marcar como concluída
            </label>
          </div>
        </div>
      </Modal>
    </>
  )
}
