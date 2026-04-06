import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useAgenda(foyerId) {
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'agenda'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setEvenements(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => a.date.localeCompare(b.date))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addEvenement({ titre, date, ajoutePar, commun }) {
    await addDoc(collection(db, 'agenda'), {
      foyerId,
      titre,
      date,
      ajoutePar,
      commun: commun ?? false,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteEvenement(id) {
    await deleteDoc(doc(db, 'agenda', id))
  }

  return { evenements, loading, addEvenement, deleteEvenement }
}
