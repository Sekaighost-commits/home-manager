import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useCourses(foyerId) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'coursesArticles'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setArticles(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(a => !a.archived)
          .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addArticle({ nom, categorie, ajoutePar }) {
    await addDoc(collection(db, 'coursesArticles'), {
      foyerId,
      nom,
      categorie,
      fait: false,
      faitPar: null,
      ajoutePar,
      createdAt: serverTimestamp(),
    })
  }

  async function toggleArticle(id, fait, uid) {
    await updateDoc(doc(db, 'coursesArticles', id), {
      fait,
      faitPar: fait ? uid : null,
    })
  }

  async function deleteArticle(id) {
    await deleteDoc(doc(db, 'coursesArticles', id))
  }

  async function clearDone() {
    const done = articles.filter(a => a.fait)
    await Promise.all(done.map(a => updateDoc(doc(db, 'coursesArticles', a.id), {
      archived: true,
      archivedAt: serverTimestamp(),
    })))
  }

  return { articles, loading, addArticle, toggleArticle, deleteArticle, clearDone }
}
