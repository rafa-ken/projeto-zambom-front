import React, { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Modal from './ui/Modal'

export default function ReportsList({ reports = [], loading, onUpdate, onDelete }) {
  const [editingReport, setEditingReport] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(report) {
    setEditingReport(report)
    setTitulo(report.titulo || '')
    setConteudo(report.conteudo || '')
  }

  async function save() {
    if (titulo.length < 10) {
      alert('O título deve ter pelo menos 10 caracteres')
      return
    }
    setSaving(true)
    try {
      await onUpdate(editingReport.id, { titulo, conteudo })
      setEditingReport(null)
      setTitulo('')
      setConteudo('')
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
          <p className="text-neutral-600 dark:text-neutral-400">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (!reports.length) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Nenhum relatório encontrado
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Crie seu primeiro relatório clicando no botão acima
        </p>
      </Card>
    )
  }

  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return dateB - dateA
  })

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedReports.map(report => (
          <Card
            key={report.id}
            className="hover:shadow-lg transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-2 flex-1">
                  {report.titulo}
                </h3>
                <span className="text-2xl flex-shrink-0">📄</span>
              </div>
              
              <p className="text-neutral-600 dark:text-neutral-400 line-clamp-4">
                {report.conteudo}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs text-neutral-500">
                  {report.createdAt ? new Date(report.createdAt).toLocaleDateString('pt-BR') : 'Sem data'}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(report)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(report.id)}
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
        isOpen={!!editingReport}
        onClose={() => setEditingReport(null)}
        title="Editar Relatório"
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setEditingReport(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={save}
              loading={saving}
              disabled={!titulo.trim() || titulo.length < 10 || !conteudo.trim()}
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
            placeholder="Título do relatório"
            required
            minLength={10}
            maxLength={500}
            helpText="Mínimo 10 caracteres"
          />
          <Textarea
            label="Conteúdo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Conteúdo do relatório"
            required
            rows={10}
            maxLength={500}
          />
        </div>
      </Modal>
    </>
  )
}
