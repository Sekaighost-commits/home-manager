import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotes } from '../hooks/useNotes'
import AddSheet from '../components/AddSheet'
import '../styles/module.css'

export default function NotesPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes(foyerId)

  const [contenu, setContenu] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  if (loading) return <div className="module-page" style={{ '--module-accent': '#ec4899' }} />

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = contenu.trim()
    if (!trimmed) return
    await addNote({
      contenu: trimmed,
      creePar: user.uid,
      nomCreePar: profile.nom,
      couleurCreePar: profile.couleur,
    })
    setContenu('')
    setShowForm(false)
  }

  async function handleSave(id) {
    const trimmed = editContent.trim()
    if (!trimmed) return
    await updateNote(id, trimmed, user.uid)
    setEditingId(null)
  }

  return (
    <div className="module-page" style={{ '--module-accent': '#ec4899' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Notes</span>
        <span className="page-header__action" />
      </header>

      <div className="item-list">
        {notes.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">📝</span>
            <span className="empty-state__text">Aucune note</span>
          </div>
        )}

        {notes.map(note => (
          <div key={note.id} className="list-item">
            <div
              className="list-item__color-dot"
              style={{ background: note.couleurCreePar }}
            />
            <div className="list-item__body">
              {editingId === note.id ? (
                <>
                  <textarea
                    className="note-edit-textarea"
                    aria-label="modifier"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                  <div className="note-edit-actions">
                    <button
                      aria-label="sauvegarder"
                      onClick={() => handleSave(note.id)}
                    >
                      Sauvegarder
                    </button>
                    <button
                      aria-label="annuler"
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <div className="list-item__nom">{note.contenu}</div>
              )}
            </div>
            {editingId !== note.id && (
              <>
                <button
                  className="list-item__edit"
                  aria-label="éditer"
                  onClick={() => { setEditingId(note.id); setEditContent(note.contenu) }}
                >
                  ✏️
                </button>
                <button
                  className="list-item__delete"
                  aria-label="supprimer"
                  onClick={() => deleteNote(note.id)}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <button className="fab" aria-label="Nouveau" onClick={() => setShowForm(true)}>+</button>

      <AddSheet open={showForm} onClose={() => setShowForm(false)} title="Nouvelle note">
        <form role="form" className="sheet-form" onSubmit={handleSubmit} aria-label="Ajouter une note">
          <textarea
            className="note-edit-textarea"
            aria-label="nouvelle note"
            placeholder="Nouvelle note…"
            value={contenu}
            onChange={e => setContenu(e.target.value)}
          />
          <button type="submit" className="sheet-form__submit">Ajouter</button>
        </form>
      </AddSheet>
    </div>
  )
}
