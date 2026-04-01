import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useRepas(foyerId) {
  const [idees, setIdees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'repasIdees'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setIdees(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addIdee({ nom, type, ajoutePar }) {
    await addDoc(collection(db, 'repasIdees'), {
      foyerId,
      nom,
      type,
      fait: false,
      ajoutePar,
      createdAt: serverTimestamp(),
    })
  }

  async function toggleIdee(id, fait) {
    await updateDoc(doc(db, 'repasIdees', id), { fait })
  }

  async function deleteIdee(id) {
    await deleteDoc(doc(db, 'repasIdees', id))
  }

  async function clearCuisinees() {
    const cuisinees = idees.filter(i => i.fait)
    await Promise.all(cuisinees.map(i => deleteDoc(doc(db, 'repasIdees', i.id))))
  }

  return { idees, loading, addIdee, toggleIdee, deleteIdee, clearCuisinees }
}
