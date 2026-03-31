import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import './ProfilePage.css'

const COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#ef4444',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
]

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [nom, setNom] = useState(profile?.nom ?? '')
  const [couleur, setCouleur] = useState(profile?.couleur ?? '#2563eb')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initial = nom?.[0]?.toUpperCase() ?? '?'

  async function handleSave() {
    if (!nom.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'utilisateurs', user.uid), {
        nom: nom.trim(),
        couleur,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="profile">
      <div className="profile__header">
        <button className="profile__back" onClick={() => navigate('/')}>‹ Retour</button>
        <h1 className="profile__title">Profil</h1>
        <div style={{ width: 60 }} />
      </div>

      {/* Avatar initiales */}
      <div className="profile__avatar-wrap">
        <div className="profile__avatar" style={{ background: couleur }}>
          <span>{initial}</span>
        </div>
        <p className="profile__avatar-hint">Ton avatar est généré depuis ton prénom et ta couleur</p>
      </div>

      {/* Nom */}
      <div className="profile__section">
        <label className="profile__label">Prénom</label>
        <input
          className="profile__input"
          value={nom}
          onChange={e => setNom(e.target.value)}
        />
      </div>

      {/* Couleur */}
      <div className="profile__section">
        <label className="profile__label">Couleur</label>
        <div className="profile__colors">
          {COLORS.map(c => (
            <button
              key={c}
              className={`profile__swatch ${couleur === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setCouleur(c)}
              aria-label={`couleur ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Code foyer */}
      <div className="profile__section">
        <label className="profile__label">Code foyer</label>
        <div className="profile__foyer-code">{profile?.foyerId ?? '—'}</div>
        <p className="profile__foyer-hint">Partage ce code avec ton/ta partenaire pour qu'il/elle rejoigne ton foyer</p>
      </div>

      {/* Save */}
      <button
        className={`profile__save-btn ${saved ? 'saved' : ''}`}
        onClick={handleSave}
        disabled={saving || !nom.trim()}
      >
        {saved ? '✓ Enregistré' : saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>

      {/* Logout */}
      <button className="profile__logout-btn" onClick={handleLogout}>
        Se déconnecter
      </button>
    </div>
  )
}
