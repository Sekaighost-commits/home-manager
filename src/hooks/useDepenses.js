import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useDepenses(foyerId) {
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'depenses'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setDepenses(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addDepense({ description, montant, categorie, ajoutePar }) {
    await addDoc(collection(db, 'depenses'), {
      foyerId,
      description,
      montant,
      categorie,
      ajoutePar,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteDepense(id) {
    await deleteDoc(doc(db, 'depenses', id))
  }

  return { depenses, loading, addDepense, deleteDepense }
}
