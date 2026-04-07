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

  it('returns loading=false when foyerId is null', () => {
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

  it('clearDone calls updateDoc with { archived: true, archivedAt } instead of deleteDoc', async () => {
    const { onSnapshot, updateDoc, deleteDoc } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementationOnce((q, cb) => {
      cb({ docs: [{ id: 'a1', data: () => ({ fait: true, nom: 'Lait', createdAt: { seconds: 1 } }) }] })
      return mockUnsub
    })
    const { result } = renderHook(() => useCourses('foyer-1'))
    await act(async () => {
      await result.current.clearDone()
    })
    expect(updateDoc).toHaveBeenCalledOnce()
    const arg = vi.mocked(updateDoc).mock.calls[0][1]
    expect(arg.archived).toBe(true)
    expect(arg.archivedAt).toBeDefined()
    expect(deleteDoc).not.toHaveBeenCalled()
  })

  it('onSnapshot excludes archived articles from articles list', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementationOnce((q, cb) => {
      cb({
        docs: [
          { id: 'a1', data: () => ({ nom: 'Lait', fait: false, archived: false, createdAt: { seconds: 1 } }) },
          { id: 'a2', data: () => ({ nom: 'Pain', fait: true,  archived: true,  createdAt: { seconds: 2 } }) },
        ],
      })
      return mockUnsub
    })
    const { result } = renderHook(() => useCourses('foyer-1'))
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].nom).toBe('Lait')
  })
})
