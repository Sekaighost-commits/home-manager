import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRepas } from '../src/hooks/useRepas'

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

describe('useRepas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty idees initially', () => {
    const { result } = renderHook(() => useRepas('foyer-1'))
    expect(result.current.idees).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns empty idees when foyerId is null', () => {
    const { result } = renderHook(() => useRepas(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.idees).toEqual([])
  })

  it('calls addDoc when addIdee is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useRepas('foyer-1'))
    await act(async () => {
      await result.current.addIdee({ nom: 'Pasta', type: 'dîner', ajoutePar: 'uid-yves' })
    })
    expect(addDoc).toHaveBeenCalledOnce()
  })

  it('calls updateDoc when toggleIdee is called', async () => {
    const { updateDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useRepas('foyer-1'))
    await act(async () => {
      await result.current.toggleIdee('idee-1', true)
    })
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('calls deleteDoc when deleteIdee is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useRepas('foyer-1'))
    await act(async () => {
      await result.current.deleteIdee('idee-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('calls deleteDoc for each cuisinee when clearCuisinees is called', async () => {
    const { onSnapshot, deleteDoc } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementationOnce((q, cb) => {
      cb({
        docs: [
          { id: 'i1', data: () => ({ nom: 'Pasta', type: 'dîner', fait: true }) },
          { id: 'i2', data: () => ({ nom: 'Salade', type: 'déjeuner', fait: false }) },
          { id: 'i3', data: () => ({ nom: 'Soupe', type: 'autre', fait: true }) },
        ],
      })
      return mockUnsub
    })
    const { result } = renderHook(() => useRepas('foyer-1'))
    await act(async () => {
      await result.current.clearCuisinees()
    })
    expect(deleteDoc).toHaveBeenCalledTimes(2)
  })
})
