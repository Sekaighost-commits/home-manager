import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDepenses } from '../src/hooks/useDepenses'

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

describe('useDepenses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty depenses and loading false initially', () => {
    const { result } = renderHook(() => useDepenses('foyer-1'))
    expect(result.current.depenses).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns empty depenses when foyerId is null', () => {
    const { result } = renderHook(() => useDepenses(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.depenses).toEqual([])
  })

  it('calls addDoc with correct data including foyerId', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useDepenses('foyer-1'))
    await act(async () => {
      await result.current.addDepense({
        description: 'Essence',
        montant: 55.40,
        categorie: 'Transport',
        ajoutePar: 'uid-yves',
      })
    })
    expect(addDoc).toHaveBeenCalledOnce()
    const arg = vi.mocked(addDoc).mock.calls[0][1]
    expect(arg.foyerId).toBe('foyer-1')
    expect(arg.description).toBe('Essence')
    expect(arg.montant).toBe(55.40)
    expect(arg.categorie).toBe('Transport')
  })

  it('calls deleteDoc when deleteDepense is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useDepenses('foyer-1'))
    await act(async () => {
      await result.current.deleteDepense('dep-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
