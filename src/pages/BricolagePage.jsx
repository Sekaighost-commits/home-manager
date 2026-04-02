import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useBricolage } from '../hooks/useBricolage'
import '../styles/module.css'

const PILLS = ['Tout', 'À faire', 'En cours', 'Terminé']

const PILL_TO_STATUT = {
  'À faire': 'todo',
  'En cours': 'inprogress',
  'Terminé': 'done',
}

const STATUT_NEXT = { todo: 'inprogress', inprogress: 'done', done: 'todo' }
const STATUT_NEXT_LABEL = { todo: 'Démarrer', inprogress: 'Terminer', done: 'Rouvrir' }

const PRIORITE_BADGE = {
  urgent: 'Urgente',
  normal: 'Normale',
  low: 'Basse',
}

export default function BricolagePage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null
  const { travaux, loading, addTravail, updateStatut, deleteTravail } = useBricolage(foyerId)

  const [activePill, setActivePill] = useState('Tout')
  const [titre, setTitre] = useState('')
  const [priorite, setPriorite] = useState('normal')

  if (loading) return <div className="module-page" />

  const filtered = activePill === 'Tout'
    ? travaux
    : travaux.filter(t => t.statut === PILL_TO_STATUT[activePill])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = titre.trim()
    if (!trimmed) return
    await addTravail({ titre: trimmed, notes: '', priorite, createdBy: user.uid })
    setTitre('')
  }

  return (
    <div className="module-page">
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Bricolage</span>
        <span className="page-header__action" />
      </header>

      <div className="filter-pills">
        {PILLS.map(pill => (
          <button
            key={pill}
            className={`filter-pill${activePill === pill ? ' active' : ''}`}
            onClick={() => setActivePill(pill)}
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="item-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🔧</span>
            <span className="empty-state__text">Aucun travail</span>
          </div>
        )}

        {filtered.map(travail => (
          <div key={travail.id} className={`list-item${travail.statut === 'done' ? ' done' : ''}`}>
            <div className="list-item__body">
              <div className="list-item__nom">{travail.titre}</div>
              <div className="list-item__meta">
                {PRIORITE_BADGE[travail.priorite]}
                {travail.notes ? ` — ${travail.notes}` : ''}
              </div>
            </div>
            <button
              className="list-item__action"
              onClick={() => updateStatut(travail.id, STATUT_NEXT[travail.statut])}
            >
              {STATUT_NEXT_LABEL[travail.statut]}
            </button>
            <button
              className="list-item__delete"
              aria-label="supprimer"
              onClick={() => deleteTravail(travail.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form
        role="form"
        className="add-form"
        onSubmit={handleSubmit}
        aria-label="Ajouter un travail"
      >
        <select
          className="add-form__select"
          value={priorite}
          onChange={e => setPriorite(e.target.value)}
        >
          <option value="urgent">Urgente</option>
          <option value="normal">Normale</option>
          <option value="low">Basse</option>
        </select>
        <input
          className="add-form__input"
          placeholder="Titre du travail…"
          value={titre}
          onChange={e => setTitre(e.target.value)}
        />
        <button type="submit" className="add-form__btn" aria-label="Ajouter">+</button>
      </form>
    </div>
  )
}
