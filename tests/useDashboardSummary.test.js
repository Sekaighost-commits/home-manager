import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useDashboardSummary } from '../src/hooks/useDashboardSummary'

vi.mock('../src/hooks/useCourses', () => ({
  useCourses: vi.fn(() => ({
    articles: [
      { id: '1', fait: false },
      { id: '2', fait: false },
      { id: '3', fait: true },
    ],
    loading: false,
  })),
}))

vi.mock('../src/hooks/useFrigo', () => ({
  useFrigo: vi.fn(() => ({
    produits: [
      { id: 'p1', dateExpiration: null },
      { id: 'p2', dateExpiration: null },
    ],
    expirants: [{ id: 'p3', nom: 'Yaourt', dateExpiration: '2026-04-01' }],
    loading: false,
  })),
}))

describe('useDashboardSummary', () => {
  it('returns correct courses subtitle when there are items', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.courses.subtitle).toBe('2 à acheter')
  })

  it('returns "Liste vide" when no unchecked articles', async () => {
    const { useCourses } = await import('../src/hooks/useCourses')
    vi.mocked(useCourses).mockReturnValueOnce({ articles: [], loading: false })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.courses.subtitle).toBe('Liste vide')
  })

  it('returns frigo expirants count as badge', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.frigo.badge).toBe(1)
  })

  it('returns frigo alert message when there are expirants', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.frigo.alertMessage).toMatch(/1 produit/)
  })

  it('returns null alertMessage when no expirants', async () => {
    const { useFrigo } = await import('../src/hooks/useFrigo')
    vi.mocked(useFrigo).mockReturnValueOnce({ produits: [], expirants: [], loading: false })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.frigo.alertMessage).toBeNull()
  })
})
