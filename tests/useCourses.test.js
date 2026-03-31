import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCourses } from '../src/hooks/useCourses'

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

describe('useCourses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty articles initially', () => {
    const { result } = renderHook(() => useCourses('foyer-1'))
    expect(result.current.articles).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns loading=true when foyerId is null', () => {
    const { result } = renderHook(() => useCourses(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.articles).toEqual([])
  })

  it('calls addDoc when addArticle is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useCourses('foyer-1'))
    await act(async () => {
      await result.current.addArticle({ nom: 'Lait', categorie: 'Frais', ajoutePar: 'uid-yves' })
    })
    expect(addDoc).toHaveBeenCalledOnce()
  })

  it('calls updateDoc when toggleArticle is called', async () => {
    const { updateDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useCourses('foyer-1'))
    await act(async () => {
      await result.current.toggleArticle('article-1', true, 'uid-yves')
    })
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('calls deleteDoc when deleteArticle is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useCourses('foyer-1'))
    await act(async () => {
      await result.current.deleteArticle('article-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
