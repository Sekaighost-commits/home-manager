// src/hooks/useRecap.js
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useRecap(foyerId, annee, mois) {
  const [courses, setCourses]   = useState([])
  const [depenses, setDepenses] = useState([])
  const [agenda, setAgenda]     = useState([])
  const [resolved, setResolved] = useState([false, false, false])

  useEffect(() => {
    if (!foyerId) return

    // Réinitialiser loading à chaque changement de mois
    setResolved([false, false, false])

    const debut = Timestamp.fromDate(new Date(annee, mois, 1))
    const fin   = Timestamp.fromDate(new Date(annee, mois + 1, 1))
    // Construire les bornes string sans passer par toISOString() (évite le décalage UTC)
    const pad = n => String(n).padStart(2, '0')
    const debutStr = `${annee}-${pad(mois + 1)}-01`
    const finStr   = mois === 11 ? `${annee + 1}-01-01` : `${annee}-${pad(mois + 2)}-01`

    const mark = (idx) => setResolved(prev => {
      const next = [...prev]
      next[idx] = true
      return next
    })

    const q1 = query(
      collection(db, 'coursesArticles'),
      where('foyerId', '==', foyerId),
      where('archived', '==', true),
      where('archivedAt', '>=', debut),
      where('archivedAt', '<', fin)
    )
    const unsub1 = onSnapshot(q1, snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      mark(0)
    })

    const q2 = query(
      collection(db, 'depenses'),
      where('foyerId', '==', foyerId),
      where('createdAt', '>=', debut),
      where('createdAt', '<', fin)
    )
    const unsub2 = onSnapshot(q2, snap => {
      setDepenses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      mark(1)
    })

    const q3 = query(
      collection(db, 'agenda'),
      where('foyerId', '==', foyerId),
      where('date', '>=', debutStr),
      where('date', '<', finStr)
    )
    const unsub3 = onSnapshot(q3, snap => {
      setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      mark(2)
    })

    return () => { unsub1(); unsub2(); unsub3() }
  }, [foyerId, annee, mois])

  const loading = !foyerId ? false : !resolved.every(Boolean)

  const totalDepenses = depenses.reduce((sum, d) => sum + (d.montant ?? 0), 0)

  const depensesParCategorie = Object.entries(
    depenses.reduce((acc, d) => {
      acc[d.categorie] = (acc[d.categorie] ?? 0) + (d.montant ?? 0)
      return acc
    }, {})
  )
    .map(([categorie, total]) => ({ categorie, total }))
    .sort((a, b) => b.total - a.total)

  return { courses, depenses, agenda, totalDepenses, depensesParCategorie, loading }
}
