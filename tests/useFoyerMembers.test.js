import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFoyerMembers } from '../src/hooks/useFoyerMembers'

vi.mock('../src/firebase.js', () => ({ db: {} }))

const mockUnsub = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, cb) => {
    cb({
      docs: [
        { id: 'uid-yves', data: () => ({ nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' }) },
        { id: 'uid-sara', data: () => ({ nom: 'Sara', couleur: '#16a34a', foyerId: 'foyer-1' }) },
      ],
    })
    return mockUnsub
  }),
}))

describe('useFoyerMembers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns membres:[] and loading:false when foyerId is null', () => {
    const { result } = renderHook(() => useFoyerMembers(null))
    expect(result.current.membres).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns members from Firestore snapshot', () => {
    const { result } = renderHook(() => useFoyerMembers('foyer-1'))
    expect(result.current.loading).toBe(false)
    expect(result.current.membres).toHaveLength(2)
    expect(result.current.membres[0]).toEqual({ uid: 'uid-yves', nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' })
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useFoyerMembers('foyer-1'))
    unmount()
    expect(mockUnsub).toHaveBeenCalledOnce()
  })
})
