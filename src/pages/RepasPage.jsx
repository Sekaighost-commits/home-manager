import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRepas } from '../hooks/useRepas'
import '../styles/module.css'

const PILLS = ['Tout', 'Déjeuner', 'Dîner', 'Autre']

const PILL_TO_TYPE = {
  Déjeuner: 'déjeuner',
  Dîner: 'dîner',
  Autre: 'autre',
}

export default function RepasPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null
  const { idees, loading, addIdee, toggleIdee, deleteIdee, clearCuisinees } = useRepas(foyerId)

  const [activePill, setActivePill] = useState('Tout')
  const [nom, setNom] = useState('')
  const [type, setType] = useState('dîner')

  if (loading) return <div className="module-page" />

  const filtered = activePill === 'Tout'
    ? idees
    : idees.filter(i => i.type === PILL_TO_TYPE[activePill])

  const pending = filtered.filter(i => !i.fait)
  const cuisinees = filtered.filter(i => i.fait)
  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = nom.trim()
    if (!trimmed) return
    await addIdee({ nom: trimmed, type, ajoutePar: user.uid })
    setNom('')
  }

  return (
    <div className="module-page">
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Idées Repas</span>
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
        {!loading && pending.length === 0 && cuisinees.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🍽️</span>
            <span className="empty-state__text">Aucune idée de repas</span>
          </div>
        )}

        {pending.map(idee => (
          <div key={idee.id} className="list-item">
            <button
              className="list-item__check"
              aria-label="toggle"
              onClick={() => toggleIdee(idee.id, true)}
            />
            <div className="list-item__body">
              <div className="list-item__nom">{idee.nom}</div>
              <div className="list-item__meta">{idee.type}</div>
            </div>
            <button
              className="list-item__delete"
              aria-label="supprimer"
              onClick={() => deleteIdee(idee.id)}
            >
              ×
            </button>
          </div>
        ))}

        {cuisinees.length > 0 && (
          <>
            <div className="section-label">Cuisinées</div>
            {cuisinees.map(idee => (
              <div key={idee.id} className="list-item done">
                <button
                  className="list-item__check checked"
                  aria-label="toggle"
                  onClick={() => toggleIdee(idee.id, false)}
                >
                  ✓
                </button>
                <div className="list-item__body">
                  <div className="list-item__nom">{idee.nom}</div>
                  <div className="list-item__meta">{idee.type}</div>
                </div>
                <button
                  className="list-item__delete"
                  aria-label="supprimer"
                  onClick={() => deleteIdee(idee.id)}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="clear-btn" onClick={clearCuisinees}>
              Vider les cuisinées
            </button>
          </>
        )}
      </div>

      <form
        role="form"
        className="add-form"
        onSubmit={handleSubmit}
        aria-label="Ajouter une idée"
      >
        <select
          className="add-form__select"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="dîner">dîner</option>
          <option value="déjeuner">déjeuner</option>
          <option value="autre">autre</option>
        </select>
        <input
          className="add-form__input"
          placeholder="Ajouter une idée…"
          value={nom}
          onChange={e => setNom(e.target.value)}
        />
        <button type="submit" className="add-form__btn" aria-label="Ajouter">+</button>
      </form>
    </div>
  )
}
