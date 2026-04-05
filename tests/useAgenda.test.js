import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAgenda } from '../src/hooks/useAgenda'

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
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}))

describe('useAgenda', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty evenements and loading false initially', () => {
    const { result } = renderHook(() => useAgenda('foyer-1'))
    expect(result.current.evenements).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns empty evenements when foyerId is null', () => {
    const { result } = renderHook(() => useAgenda(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.evenements).toEqual([])
  })

  it('calls addDoc with correct data including foyerId when addEvenement is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useAgenda('foyer-1'))
    await act(async () => {
      await result.current.addEvenement({
        titre: 'Anniversaire de Enza',
        date: '2026-04-20',
        ajoutePar: 'uid-yves',
      })
    })
    expect(addDoc).toHaveBeenCalledOnce()
    const arg = vi.mocked(addDoc).mock.calls[0][1]
    expect(arg.foyerId).toBe('foyer-1')
    expect(arg.titre).toBe('Anniversaire de Enza')
    expect(arg.date).toBe('2026-04-20')
    expect(arg.ajoutePar).toBe('uid-yves')
  })

  it('calls deleteDoc when deleteEvenement is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useAgenda('foyer-1'))
    await act(async () => {
      await result.current.deleteEvenement('evt-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
