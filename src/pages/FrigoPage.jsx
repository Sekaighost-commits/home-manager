import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFrigo, getExpiryStatus } from '../hooks/useFrigo'
import AddSheet from '../components/AddSheet'
import '../styles/module.css'

const EMPLACEMENTS = ['frigo', 'congelateur', 'garde-manger']
const LABELS = { frigo: 'Frigo', congelateur: 'Congélateur', 'garde-manger': 'Garde-manger' }
const TAG_LABELS = { frigo: 'réfrigérateur', congelateur: 'congélateur', 'garde-manger': 'garde-manger' }

function ProduitItem({ produit, onDelete }) {
  const status = getExpiryStatus(produit.dateExpiration)
  const daysLeft = produit.dateExpiration
    ? (() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const exp = new Date(produit.dateExpiration)
        exp.setHours(0, 0, 0, 0)
        return Math.ceil((exp - today) / (1000 * 60 * 60 * 24))
      })()
    : null

  return (
    <div className="list-item">
      <div className="list-item__body">
        <div className="list-item__nom">{produit.nom}</div>
        <div className="list-item__meta">
          {produit.quantite} · <span className="location-tag">{TAG_LABELS[produit.emplacement]}</span>
        </div>
      </div>
      {status && (
        <span className={`expiry-badge ${status}`}>
          {daysLeft <= 0 ? 'Expiré' : daysLeft === 1 ? 'Demain' : `${daysLeft}j`}
        </span>
      )}
      {!status && produit.dateExpiration && (
        <span className="list-item__meta">{produit.dateExpiration}</span>
      )}
      <button className="list-item__delete" onClick={onDelete} aria-label="supprimer">×</button>
    </div>
  )
}

export default function FrigoPage() {
  const { user, profile } = useAuth()
  const { produits, loading, addProduit, deleteProduit } = useFrigo(profile?.foyerId)
  const navigate = useNavigate()

  const [newNom, setNewNom] = useState('')
  const [quantite, setQuantite] = useState('1')
  const [emplacement, setEmplacement] = useState('frigo')
  const [dateExp, setDateExp] = useState('')
  const [filtre, setFiltre] = useState('Tout')
  const [showForm, setShowForm] = useState(false)

  const PILL_TO_EMPLACEMENT = { 'Frigo': 'frigo', 'Congélateur': 'congelateur', 'Garde-manger': 'garde-manger' }
  const filtered = filtre === 'Tout' ? produits : produits.filter(p => p.emplacement === PILL_TO_EMPLACEMENT[filtre])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newNom.trim()) return
    await addProduit({
      nom: newNom.trim(),
      quantite,
      emplacement,
      dateExpiration: dateExp || null,
      ajoutePar: user.uid,
    })
    setNewNom('')
    setQuantite('1')
    setDateExp('')
    setShowForm(false)
  }

  if (loading) return <div className="module-page" style={{ '--module-accent': '#06b6d4' }} />

  return (
    <div className="module-page" style={{ '--module-accent': '#06b6d4' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')}>‹ Retour</button>
        <h1 className="page-header__title">Frigo</h1>
        <div className="page-header__action" />
      </header>

      <div className="filter-pills">
        {['Tout', 'Frigo', 'Congélateur', 'Garde-manger'].map(c => (
          <button
            key={c}
            className={`filter-pill ${filtre === c ? 'active' : ''}`}
            onClick={() => setFiltre(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="item-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🧊</span>
            <p className="empty-state__text">Rien ici</p>
          </div>
        )}
        {filtered.map(p => (
          <ProduitItem key={p.id} produit={p} onDelete={() => deleteProduit(p.id)} />
        ))}
      </div>

      <button className="fab" aria-label="Nouveau" onClick={() => setShowForm(true)}>+</button>

      <AddSheet open={showForm} onClose={() => setShowForm(false)} title="Nouveau produit">
        <form aria-label="form" role="form" className="sheet-form" onSubmit={handleAdd}>
          <input
            className="add-form__input"
            value={newNom}
            onChange={e => setNewNom(e.target.value)}
            placeholder="Ajouter un produit…"
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="add-form__input"
              value={quantite}
              onChange={e => setQuantite(e.target.value)}
              placeholder="Qté"
              style={{ maxWidth: 70 }}
            />
            <select className="add-form__select" style={{ flex: 1, maxWidth: 'none' }} value={emplacement} onChange={e => setEmplacement(e.target.value)}>
              {EMPLACEMENTS.map(e => <option key={e} value={e}>{LABELS[e]}</option>)}
            </select>
          </div>
          <input
            className="add-form__input"
            type="date"
            value={dateExp}
            onChange={e => setDateExp(e.target.value)}
          />
          <button type="submit" className="sheet-form__submit">Ajouter</button>
        </form>
      </AddSheet>
    </div>
  )
}
