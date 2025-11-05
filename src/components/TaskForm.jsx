import React, { useState } from 'react'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'

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
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Título"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        placeholder="Título da tarefa (opcional)"
        maxLength={200}
        helpText="Opcional - deixe em branco se preferir"
      />

      <Textarea
        label="Descrição"
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        placeholder="Descreva a tarefa"
        required
        rows={4}
        maxLength={200}
      />

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} loading={loading} fullWidth>
          {loading ? 'Criando...' : 'Criar Tarefa'}
        </Button>
      </div>
    </form>
  )
}
