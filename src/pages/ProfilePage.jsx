import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, app } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import './ProfilePage.css'

const COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#ef4444',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
]

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [nom, setNom] = useState(profile?.nom ?? '')
  const [couleur, setCouleur] = useState(profile?.couleur ?? '#2563eb')
  const [photoURL, setPhotoURL] = useState(profile?.photoURL ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initial = nom?.[0]?.toUpperCase() ?? '?'

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const storage = getStorage(app)
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setPhotoURL(url)
    } catch (err) {
      console.error('Upload échoué', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!nom.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'utilisateurs', user.uid), {
        nom: nom.trim(),
        couleur,
        ...(photoURL ? { photoURL } : {}),
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

      {/* Avatar */}
      <div className="profile__avatar-wrap">
        <div className="profile__avatar" style={{ background: couleur }}>
          {photoURL
            ? <img src={photoURL} alt="avatar" className="profile__avatar-img" />
            : <span>{initial}</span>
          }
        </div>
        <button
          className="profile__photo-btn"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Envoi…' : '📷 Changer la photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhoto}
        />
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

      {/* Aperçu foyer */}
      <div className="profile__section">
        <label className="profile__label">Code foyer</label>
        <div className="profile__foyer-code">{profile?.foyerId ?? '—'}</div>
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
