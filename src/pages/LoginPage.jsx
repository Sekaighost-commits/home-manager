import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import {
  doc, setDoc, addDoc, collection,
  serverTimestamp, arrayUnion, updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import '../styles/login.css'

const COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#ef4444',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
]

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [couleur, setCouleur] = useState('#2563eb')
  const [foyerMode, setFoyerMode] = useState('create')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newFoyerId, setNewFoyerId] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Remplis tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!nom || !email || !password) {
      setError('Remplis tous les champs.')
      return
    }
    if (foyerMode === 'join' && !joinCode.trim()) {
      setError('Entre le code du foyer.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      let foyerId

      if (foyerMode === 'create') {
        const foyerRef = await addDoc(collection(db, 'foyers'), {
          membres: [user.uid],
          createdAt: serverTimestamp(),
        })
        foyerId = foyerRef.id
        setNewFoyerId(foyerId)
      } else {
        foyerId = joinCode.trim()
        await updateDoc(doc(db, 'foyers', foyerId), {
          membres: arrayUnion(user.uid),
        })
      }

      await setDoc(doc(db, 'utilisateurs', user.uid), {
        nom,
        couleur,
        foyerId,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-handle" />
        <div className="login-logo">🏠</div>
        <h1 className="login-title">Home Manager</h1>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Connexion
          </button>
          <button
            className={`login-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Créer un compte
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="nom">Prénom</label>
              <input
                id="nom"
                className="login-input"
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
              />
            </div>
            <div className="login-field">
              <label className="login-label">Couleur</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${couleur === c ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setCouleur(c)}
                    aria-label={`couleur ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="email-signup">Email</label>
              <input
                id="email-signup"
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="password-signup">Mot de passe</label>
              <input
                id="password-signup"
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="login-field">
              <label className="login-label">Foyer</label>
              <div className="foyer-toggle">
                <button
                  type="button"
                  className={`foyer-btn ${foyerMode === 'create' ? 'active' : ''}`}
                  onClick={() => setFoyerMode('create')}
                >
                  🏠 Créer un foyer
                </button>
                <button
                  type="button"
                  className={`foyer-btn ${foyerMode === 'join' ? 'active' : ''}`}
                  onClick={() => setFoyerMode('join')}
                >
                  🔗 Rejoindre
                </button>
              </div>
              {foyerMode === 'join' && (
                <input
                  className="login-input"
                  style={{ marginTop: '0.5rem' }}
                  type="text"
                  placeholder="Code du foyer"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                />
              )}
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            {newFoyerId && (
              <div className="foyer-code-display">
                <p>✅ Foyer créé ! Partage ce code avec ton/ta partenaire :</p>
                <div className="foyer-code-value">{newFoyerId}</div>
              </div>
            )}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
