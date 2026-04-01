import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMenage } from '../src/hooks/useMenage'

vi.mock('../src/firebase.js', () => ({ auth: {}, db: {} }))

const mockUnsub = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, cb) => {
    cb({ docs: [] })
    return mockUnsub
  }),
  addDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}))

describe('useMenage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty taches initially', () => {
    const { result } = renderHook(() => useMenage('foyer-1'))
    expect(result.current.taches).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns empty taches when foyerId is null', () => {
    const { result } = renderHook(() => useMenage(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.taches).toEqual([])
  })

  it('calls addDoc when addTache is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useMenage('foyer-1'))
    await act(async () => {
      await result.current.addTache({ nom: "Passer l'aspirateur", frequence: 'hebdomadaire', ajoutePar: 'uid-yves' })
    })
    expect(addDoc).toHaveBeenCalledOnce()
  })

  it('calls updateDoc when toggleTache is called', async () => {
    const { updateDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useMenage('foyer-1'))
    await act(async () => {
      await result.current.toggleTache('tache-1', true, 'uid-yves', 'Yves')
    })
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('sets faitPar and faitParNom on toggleTache with fait=true', async () => {
    const { updateDoc, doc } = await import('firebase/firestore')
    const { result } = renderHook(() => useMenage('foyer-1'))
    await act(async () => {
      await result.current.toggleTache('tache-1', true, 'uid-yves', 'Yves')
    })
    expect(updateDoc).toHaveBeenCalledWith(
      doc('', 'menageTaches', 'tache-1'),
      { fait: true, faitPar: 'uid-yves', faitParNom: 'Yves' }
    )
  })

  it('clears faitPar and faitParNom on toggleTache with fait=false', async () => {
    const { updateDoc, doc } = await import('firebase/firestore')
    const { result } = renderHook(() => useMenage('foyer-1'))
    await act(async () => {
      await result.current.toggleTache('tache-1', false, 'uid-yves', 'Yves')
    })
    expect(updateDoc).toHaveBeenCalledWith(
      doc('', 'menageTaches', 'tache-1'),
      { fait: false, faitPar: null, faitParNom: null }
    )
  })

  it('calls deleteDoc when deleteTache is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useMenage('foyer-1'))
    await act(async () => {
      await result.current.deleteTache('tache-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
