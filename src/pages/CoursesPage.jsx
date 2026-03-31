import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCourses } from '../hooks/useCourses'
import '../styles/module.css'

const CATEGORIES = ['Frais', 'Surgelés', 'Épicerie', 'Hygiène', 'Boissons', 'Autre']

function ArticleItem({ article, onToggle, onDelete, myUid }) {
  const isMe = article.ajoutePar === myUid
  return (
    <div className={`list-item ${article.fait ? 'done' : ''}`}>
      <button
        className={`list-item__check ${article.fait ? 'checked' : ''}`}
        onClick={onToggle}
        aria-label={article.fait ? 'décocher' : 'cocher'}
      >
        {article.fait && '✓'}
      </button>
      <div className="list-item__body">
        <div className="list-item__nom">{article.nom}</div>
        <div className="list-item__meta">{article.categorie}</div>
      </div>
      <div
        className="list-item__avatar"
        style={{ background: isMe ? '#2563eb' : '#16a34a' }}
      >
        {article.ajoutePar?.slice(-1).toUpperCase()}
      </div>
      <button className="list-item__delete" onClick={onDelete} aria-label="supprimer">×</button>
    </div>
  )
}

export default function CoursesPage() {
  const { user, profile } = useAuth()
  const { articles, loading, addArticle, toggleArticle, deleteArticle, clearDone } = useCourses(profile?.foyerId)
  const navigate = useNavigate()

  const [newNom, setNewNom] = useState('')
  const [categorie, setCategorie] = useState('Épicerie')
  const [filtre, setFiltre] = useState('Tout')

  const unchecked = articles.filter(a => !a.fait)
  const checked = articles.filter(a => a.fait)
  const filtered = filtre === 'Tout' ? unchecked : unchecked.filter(a => a.categorie === filtre)

  async function handleAdd(e) {
    e.preventDefault()
    if (!newNom.trim()) return
    await addArticle({ nom: newNom.trim(), categorie, ajoutePar: user.uid })
    setNewNom('')
  }

  if (loading) return <div className="module-page" />

  return (
    <div className="module-page">
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')}>‹ Retour</button>
        <h1 className="page-header__title">Courses</h1>
        <div className="page-header__action" />
      </header>

      <div className="filter-pills">
        {['Tout', ...CATEGORIES].map(c => (
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
        {filtered.length === 0 && checked.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🛒</span>
            <p className="empty-state__text">La liste est vide</p>
          </div>
        )}
        {filtered.map(a => (
          <ArticleItem
            key={a.id}
            article={a}
            myUid={user.uid}
            onToggle={() => toggleArticle(a.id, true, user.uid)}
            onDelete={() => deleteArticle(a.id)}
          />
        ))}
        {checked.length > 0 && (
          <>
            <div className="section-label">Dans le panier</div>
            {checked.map(a => (
              <ArticleItem
                key={a.id}
                article={a}
                myUid={user.uid}
                onToggle={() => toggleArticle(a.id, false, user.uid)}
                onDelete={() => deleteArticle(a.id)}
              />
            ))}
            <button className="clear-btn" onClick={clearDone}>
              Vider les cochés
            </button>
          </>
        )}
      </div>

      <form aria-label="form" role="form" className="add-form" onSubmit={handleAdd}>
        <select
          className="add-form__select"
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input
          className="add-form__input"
          value={newNom}
          onChange={e => setNewNom(e.target.value)}
          placeholder="Ajouter un article…"
        />
        <button type="submit" className="add-form__btn">+</button>
      </form>
    </div>
  )
}
