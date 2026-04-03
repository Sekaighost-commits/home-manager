import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useNotes(foyerId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!foyerId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'notesListe'),
      where('foyerId', '==', foyerId)
    )
    const unsub = onSnapshot(q, snap => {
      setNotes(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0))
      )
      setLoading(false)
    })
    return unsub
  }, [foyerId])

  async function addNote({ contenu, creePar, nomCreePar, couleurCreePar }) {
    await addDoc(collection(db, 'notesListe'), {
      foyerId,
      contenu,
      creePar,
      nomCreePar,
      couleurCreePar,
      modifiePar: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateNote(id, contenu, uid) {
    await updateDoc(doc(db, 'notesListe', id), {
      contenu,
      modifiePar: uid,
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteNote(id) {
    await deleteDoc(doc(db, 'notesListe', id))
  }

  return { notes, loading, addNote, updateNote, deleteNote }
}
