import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useBricolage(foyerId) {
  const [travaux, setTravaux] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'bricolageTravaux'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setTravaux(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addTravail({ titre, notes, priorite, createdBy }) {
    await addDoc(collection(db, 'bricolageTravaux'), {
      foyerId,
      titre,
      notes,
      statut: 'todo',
      priorite,
      createdBy,
      createdAt: serverTimestamp(),
    })
  }

  async function updateStatut(id, statut) {
    await updateDoc(doc(db, 'bricolageTravaux', id), { statut })
  }

  async function deleteTravail(id) {
    await deleteDoc(doc(db, 'bricolageTravaux', id))
  }

  return { travaux, loading, addTravail, updateStatut, deleteTravail }
}
