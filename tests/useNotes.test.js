import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotes } from '../src/hooks/useNotes'

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

describe('useNotes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty notes initially', () => {
    const { result } = renderHook(() => useNotes('foyer-1'))
    expect(result.current.notes).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns empty notes when foyerId is null', () => {
    const { result } = renderHook(() => useNotes(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.notes).toEqual([])
  })

  it('calls addDoc when addNote is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useNotes('foyer-1'))
    await act(async () => {
      await result.current.addNote({
        contenu: 'Appeler le plombier',
        creePar: 'uid-yves',
        nomCreePar: 'Yves',
        couleurCreePar: '#2563eb',
      })
    })
    expect(addDoc).toHaveBeenCalledOnce()
  })

  it('calls updateDoc when updateNote is called', async () => {
    const { updateDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useNotes('foyer-1'))
    await act(async () => {
      await result.current.updateNote('note-1', 'Nouveau contenu', 'uid-yves')
    })
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('calls deleteDoc when deleteNote is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useNotes('foyer-1'))
    await act(async () => {
      await result.current.deleteNote('note-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
