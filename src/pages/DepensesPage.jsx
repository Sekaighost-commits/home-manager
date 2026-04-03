import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDepenses } from '../hooks/useDepenses'
import '../styles/module.css'

const CATEGORIES = ['Courses', 'Restaurant', 'Transport', 'Maison', 'Loisirs', 'Autre']
const PILLS = ['Tout', ...CATEGORIES]
// Abbreviated labels for the form select to avoid text conflicts with filter pills
const CAT_SHORT = {
  Courses: 'Courses',
  Restaurant: 'Resto',
  Transport: 'Transp.',
  Maison: 'Maison',
  Loisirs: 'Loisirs',
  Autre: 'Autre',
}

export default function DepensesPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null
  const { depenses, loading, addDepense, deleteDepense } = useDepenses(foyerId)

  const [activePill, setActivePill] = useState('Tout')
  const [description, setDescription] = useState('')
  const [montant, setMontant] = useState('')
  const [categorie, setCategorie] = useState(CATEGORIES[0])

  if (loading) return <div className="module-page" />

  const filtered = activePill === 'Tout'
    ? depenses
    : depenses.filter(d => d.categorie === activePill)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = description.trim()
    const valeur = parseFloat(montant)
    if (!trimmed || !valeur || valeur <= 0) return
    await addDepense({ description: trimmed, montant: valeur, categorie, ajoutePar: user.uid })
    setDescription('')
    setMontant('')
  }

  return (
    <div className="module-page">
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Dépenses</span>
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
            <span className="empty-state__icon">💰</span>
            <span className="empty-state__text">Aucune dépense</span>
          </div>
        )}
        {filtered.map(dep => (
          <div key={dep.id} className="list-item">
            <div className="list-item__body">
              <div className="list-item__nom">{dep.description}</div>
              <div className="list-item__meta">{dep.categorie} · {(typeof dep.montant === 'number' ? dep.montant : 0).toFixed(2)} €</div>
            </div>
            <button
              className="list-item__delete"
              aria-label="supprimer"
              onClick={() => deleteDepense(dep.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form role="form" className="add-form" onSubmit={handleSubmit} aria-label="Ajouter une dépense">
        <select
          className="add-form__select"
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
          aria-label="Catégorie"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_SHORT[c] ?? c}</option>)}
        </select>
        <input
          className="add-form__input"
          placeholder="Description…"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          className="add-form__input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={montant}
          onChange={e => setMontant(e.target.value)}
          style={{ maxWidth: '72px' }}
        />
        <button type="submit" className="add-form__btn" aria-label="Ajouter">+</button>
      </form>
    </div>
  )
}
