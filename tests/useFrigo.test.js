import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFrigo, getExpiryStatus } from '../src/hooks/useFrigo'

vi.mock('../src/firebase.js', () => ({ auth: {}, db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, cb) => {
    cb({ docs: [] })
    return vi.fn()
  }),
  addDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}))

describe('getExpiryStatus', () => {
  it('returns "urgent" when product expires in 1 day', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    expect(getExpiryStatus(dateStr)).toBe('urgent')
  })

  it('returns "soon" when product expires in 3 days', () => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    const dateStr = d.toISOString().split('T')[0]
    expect(getExpiryStatus(dateStr)).toBe('soon')
  })

  it('returns null when product expires in 10 days', () => {
    const d = new Date()
    d.setDate(d.getDate() + 10)
    const dateStr = d.toISOString().split('T')[0]
    expect(getExpiryStatus(dateStr)).toBeNull()
  })

  it('returns "urgent" when product is already expired', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const dateStr = d.toISOString().split('T')[0]
    expect(getExpiryStatus(dateStr)).toBe('urgent')
  })

  it('returns null when dateExpiration is null', () => {
    expect(getExpiryStatus(null)).toBeNull()
  })
})

describe('useFrigo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty produits initially', () => {
    const { result } = renderHook(() => useFrigo('foyer-1'))
    expect(result.current.produits).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('calls addDoc when addProduit is called', async () => {
    const { addDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useFrigo('foyer-1'))
    await act(async () => {
      await result.current.addProduit({
        nom: 'Yaourt',
        quantite: '4',
        emplacement: 'frigo',
        dateExpiration: '2026-04-05',
        ajoutePar: 'uid-yves',
      })
    })
    expect(addDoc).toHaveBeenCalledOnce()
  })

  it('calls deleteDoc when deleteProduit is called', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    const { result } = renderHook(() => useFrigo('foyer-1'))
    await act(async () => {
      await result.current.deleteProduit('produit-1')
    })
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})
