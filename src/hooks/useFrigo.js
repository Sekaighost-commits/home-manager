import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Retourne 'urgent' (≤1j ou expiré), 'soon' (2-3j), ou null (>3j ou pas de date).
 */
export function getExpiryStatus(dateExpiration) {
  if (!dateExpiration) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateExpiration)
  exp.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 'urgent'
  if (diffDays <= 3) return 'soon'
  return null
}

export function useFrigo(foyerId) {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'frigoProduits'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setProduits(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addProduit({ nom, quantite, emplacement, dateExpiration, ajoutePar }) {
    await addDoc(collection(db, 'frigoProduits'), {
      foyerId,
      nom,
      quantite,
      emplacement,
      dateExpiration: dateExpiration || null,
      ajoutePar,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteProduit(id) {
    await deleteDoc(doc(db, 'frigoProduits', id))
  }

  const expirants = produits.filter(p => getExpiryStatus(p.dateExpiration) !== null)

  return { produits, loading, addProduit, deleteProduit, expirants }
}
