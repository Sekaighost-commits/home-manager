import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useFoyerMembers(foyerId) {
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(collection(db, 'utilisateurs'), where('foyerId', '==', foyerId))
    const unsub = onSnapshot(q, snap => {
      setMembres(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  return { membres, loading }
}
