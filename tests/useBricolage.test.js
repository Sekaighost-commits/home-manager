import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBricolage } from '../src/hooks/useBricolage'

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

describe('useBricolage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty travaux initially', () => {
    const { result } = renderHook(() => useBricolage('foyer-1'))
    expect(result.current.travaux).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns empty travaux when foyerId is null', () => {
    const { result } = renderHook(() => useBricolage(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.travaux).toEqual([])
  })

  it('calls addDoc with statut todo when addTravail is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useBricolage('foyer-1'))
    await act(async () => {
      await result.current.addTravail({ titre: 'Réparer robinet', notes: '', priorite: 'urgent', createdBy: 'uid-yves' })
    })
    expect(addDoc).toHaveBeenCalledOnce()
    const callArg = vi.mocked(addDoc).mock.calls[0][1]
    expect(callArg.statut).toBe('todo')
  })

  it('calls updateDoc when updateStatut is called', async () => {
    const { updateDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useBricolage('foyer-1'))
    await act(async () => {
      await result.current.updateStatut('travail-1', 'inprogress')
    })
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('calls deleteDoc when deleteTravail is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useBricolage('foyer-1'))
    await act(async () => {
      await result.current.deleteTravail('travail-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
