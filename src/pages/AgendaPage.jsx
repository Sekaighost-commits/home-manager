import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAgenda } from '../hooks/useAgenda'
import AddSheet from '../components/AddSheet'
import '../styles/module.css'

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(dateStr + 'T00:00:00'))
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null
  const { evenements, loading, addEvenement, deleteEvenement } = useAgenda(foyerId)

  const [titre, setTitre] = useState('')
  const [date, setDate] = useState('')
  const [showForm, setShowForm] = useState(false)

  if (loading) return <div className="module-page" style={{ '--module-accent': '#3b82f6' }} />

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = titre.trim()
    if (!trimmed || !date) return
    await addEvenement({ titre: trimmed, date, ajoutePar: user.uid })
    setTitre('')
    setDate('')
    setShowForm(false)
  }

  return (
    <div className="module-page" style={{ '--module-accent': '#3b82f6' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Agenda</span>
        <span className="page-header__action" />
      </header>

      <div className="item-list">
        {evenements.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">📅</span>
            <span className="empty-state__text">Aucun évènement</span>
          </div>
        )}

        {evenements.map(evt => (
          <div key={evt.id} className="list-item">
            <div className="list-item__body">
              <div className="list-item__nom">{evt.titre}</div>
              <div className="list-item__meta">{formatDate(evt.date)}</div>
            </div>
            <button
              className="list-item__delete"
              aria-label="supprimer"
              onClick={() => deleteEvenement(evt.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="fab" aria-label="Nouveau" onClick={() => setShowForm(true)}>+</button>

      <AddSheet open={showForm} onClose={() => setShowForm(false)} title="Nouvel évènement">
        <form role="form" className="sheet-form" onSubmit={handleSubmit} aria-label="Ajouter un évènement">
          <input
            className="add-form__input"
            aria-label="titre"
            placeholder="Titre…"
            value={titre}
            onChange={e => setTitre(e.target.value)}
          />
          <input
            className="add-form__input"
            type="date"
            aria-label="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button type="submit" className="sheet-form__submit">Ajouter</button>
        </form>
      </AddSheet>
    </div>
  )
}
