import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useMenage(foyerId) {
  const [taches, setTaches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'menageTaches'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setTaches(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addTache({ nom, frequence, ajoutePar }) {
    await addDoc(collection(db, 'menageTaches'), {
      foyerId,
      nom,
      frequence,
      fait: false,
      faitPar: null,
      faitParNom: null,
      ajoutePar,
      createdAt: serverTimestamp(),
    })
  }

  async function toggleTache(id, fait, uid, nom) {
    await updateDoc(doc(db, 'menageTaches', id), {
      fait,
      faitPar: fait ? uid : null,
      faitParNom: fait ? nom : null,
    })
  }

  async function deleteTache(id) {
    await deleteDoc(doc(db, 'menageTaches', id))
  }

  return { taches, loading, addTache, toggleTache, deleteTache }
}
