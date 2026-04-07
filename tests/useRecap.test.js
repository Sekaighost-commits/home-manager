// tests/useRecap.test.js
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRecap } from '../src/hooks/useRecap'

vi.mock('../src/firebase.js', () => ({ db: {} }))

const mockUnsub = vi.fn()

// On simule 3 appels onSnapshot successifs (courses, depenses, agenda)
let snapshotCallCount = 0
const mockSnapshots = [
  // courses snapshot
  {
    docs: [
      { id: 'c1', data: () => ({ nom: 'Lait', archived: true, archivedAt: { toMillis: () => 0 }, foyerId: 'foyer-1' }) },
      { id: 'c2', data: () => ({ nom: 'Pain', archived: true, archivedAt: { toMillis: () => 0 }, foyerId: 'foyer-1' }) },
    ],
  },
  // depenses snapshot
  {
    docs: [
      { id: 'd1', data: () => ({ montant: 50, categorie: 'Alimentation', createdAt: { toMillis: () => 0 } }) },
      { id: 'd2', data: () => ({ montant: 30, categorie: 'Alimentation', createdAt: { toMillis: () => 0 } }) },
      { id: 'd3', data: () => ({ montant: 20, categorie: 'Transport',    createdAt: { toMillis: () => 0 } }) },
    ],
  },
  // agenda snapshot
  {
    docs: [
      { id: 'a1', data: () => ({ titre: 'Dentiste', date: '2026-04-12', ajoutePar: 'uid-yves' }) },
    ],
  },
]

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: { fromDate: vi.fn(d => ({ toMillis: () => d.getTime() })) },
  onSnapshot: vi.fn((q, cb) => {
    const snap = mockSnapshots[snapshotCallCount % mockSnapshots.length]
    snapshotCallCount++
    cb(snap)
    return mockUnsub
  }),
}))

describe('useRecap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    snapshotCallCount = 0
  })

  it('returns data and loading:false once all 3 snapshots resolve', () => {
    const { result } = renderHook(() => useRecap('foyer-1', 2026, 3))
    expect(result.current.loading).toBe(false)
    expect(result.current.courses).toHaveLength(2)
    expect(result.current.depenses).toHaveLength(3)
    expect(result.current.agenda).toHaveLength(1)
  })

  it('calculates totalDepenses and depensesParCategorie correctly', () => {
    const { result } = renderHook(() => useRecap('foyer-1', 2026, 3))
    expect(result.current.totalDepenses).toBe(100)
    expect(result.current.depensesParCategorie).toEqual([
      { categorie: 'Alimentation', total: 80 },
      { categorie: 'Transport',    total: 20 },
    ])
  })

  it('returns empty arrays when snapshots contain no data for the month', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementation((q, cb) => {
      cb({ docs: [] })
      return mockUnsub
    })
    const { result } = renderHook(() => useRecap('foyer-1', 2026, 3))
    expect(result.current.loading).toBe(false)
    expect(result.current.courses).toEqual([])
    expect(result.current.depenses).toEqual([])
    expect(result.current.agenda).toEqual([])
    expect(result.current.totalDepenses).toBe(0)
    expect(result.current.depensesParCategorie).toEqual([])
  })

  it('returns empty arrays when foyerId is null', () => {
    const { result } = renderHook(() => useRecap(null, 2026, 3))
    expect(result.current.loading).toBe(false)
    expect(result.current.courses).toEqual([])
    expect(result.current.depenses).toEqual([])
    expect(result.current.agenda).toEqual([])
    expect(result.current.totalDepenses).toBe(0)
    expect(result.current.depensesParCategorie).toEqual([])
  })
})
