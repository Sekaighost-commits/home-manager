import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMenage } from '../hooks/useMenage'
import AddSheet from '../components/AddSheet'
import '../styles/module.css'

const PILLS = ['Tout', 'Quotidien', 'Hebdomadaire', 'Mensuel']

const PILL_TO_FREQ = {
  Quotidien: 'quotidien',
  Hebdomadaire: 'hebdomadaire',
  Mensuel: 'mensuel',
}

function getInitials(nom) {
  if (!nom) return '?'
  const parts = nom.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return nom.slice(0, 2).toUpperCase()
}

export default function MenagePage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null
  const { taches, loading, addTache, toggleTache, deleteTache } = useMenage(foyerId)

  const [activePill, setActivePill] = useState('Tout')
  const [nom, setNom] = useState('')
  const [frequence, setFrequence] = useState('hebdomadaire')
  const [showForm, setShowForm] = useState(false)

  if (loading) return <div className="module-page" style={{ '--module-accent': '#a855f7' }} />

  const filtered = activePill === 'Tout'
    ? taches
    : taches.filter(t => t.frequence === PILL_TO_FREQ[activePill])

  const pending = filtered.filter(t => !t.fait)
  const done = filtered.filter(t => t.fait)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = nom.trim()
    if (!trimmed) return
    await addTache({ nom: trimmed, frequence, ajoutePar: user.uid })
    setNom('')
    setShowForm(false)
  }

  return (
    <div className="module-page" style={{ '--module-accent': '#a855f7' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Ménage</span>
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
        {!loading && pending.length === 0 && done.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🧹</span>
            <span className="empty-state__text">Tout est propre ✨</span>
          </div>
        )}

        {pending.map(tache => (
          <div key={tache.id} className="list-item">
            <button
              className="list-item__check"
              aria-label="toggle"
              onClick={() => toggleTache(tache.id, true, user.uid, profile.nom)}
            />
            <div className="list-item__body">
              <div className="list-item__nom">{tache.nom}</div>
              <div className="list-item__meta">{tache.frequence}</div>
            </div>
            <button
              className="list-item__delete"
              aria-label="supprimer"
              onClick={() => deleteTache(tache.id)}
            >
              ×
            </button>
          </div>
        ))}

        {done.length > 0 && (
          <>
            <div className="section-label">Fait</div>
            {done.map(tache => (
              <div key={tache.id} className="list-item done">
                <button
                  className="list-item__check checked"
                  aria-label="toggle"
                  onClick={() => toggleTache(tache.id, false, user.uid, profile.nom)}
                >
                  ✓
                </button>
                <div className="list-item__body">
                  <div className="list-item__nom">{tache.nom}</div>
                  <div className="list-item__meta">{tache.frequence}</div>
                </div>
                {tache.faitParNom && (
                  <div
                    className="list-item__avatar"
                    style={{ background: profile.couleur }}
                    title={tache.faitParNom}
                  >
                    {getInitials(tache.faitParNom)}
                  </div>
                )}
                <button
                  className="list-item__delete"
                  aria-label="supprimer"
                  onClick={() => deleteTache(tache.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <button className="fab" aria-label="Nouveau" onClick={() => setShowForm(true)}>+</button>

      <AddSheet open={showForm} onClose={() => setShowForm(false)} title="Nouvelle tâche">
        <form role="form" className="sheet-form" onSubmit={handleSubmit} aria-label="Ajouter une tâche">
          <select
            className="add-form__select"
            value={frequence}
            onChange={e => setFrequence(e.target.value)}
            style={{ maxWidth: 'none' }}
          >
            <option value="hebdomadaire">Hebdo</option>
            <option value="quotidien">Quotidien (j)</option>
            <option value="mensuel">Mensuel (m)</option>
          </select>
          <input
            className="add-form__input"
            placeholder="Ajouter une tâche…"
            value={nom}
            onChange={e => setNom(e.target.value)}
          />
          <button type="submit" className="sheet-form__submit">Ajouter</button>
        </form>
      </AddSheet>
    </div>
  )
}
