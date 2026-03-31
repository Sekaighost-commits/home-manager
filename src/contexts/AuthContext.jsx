import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubProfile = null

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null }

      if (firebaseUser) {
        setUser(firebaseUser)
        unsubProfile = onSnapshot(doc(db, 'utilisateurs', firebaseUser.uid), (snap) => {
          setProfile(snap.exists() ? snap.data() : null)
          setLoading(false)
        })
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      if (unsubProfile) unsubProfile()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
