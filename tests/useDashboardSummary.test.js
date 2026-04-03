import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardSummary } from '../src/hooks/useDashboardSummary'
import { useRepas } from '../src/hooks/useRepas'
import { useMenage } from '../src/hooks/useMenage'
import { useDepenses } from '../src/hooks/useDepenses'

vi.mock('../src/hooks/useCourses', () => ({
  useCourses: vi.fn(() => ({
    articles: [
      { id: 'a1', nom: 'Lait', fait: false },
      { id: 'a2', nom: 'Pain', fait: true },
    ],
    loading: false,
  })),
}))

vi.mock('../src/hooks/useFrigo', () => ({
  useFrigo: vi.fn(() => ({
    produits: [
      { id: 'p1', nom: 'Yaourt', emplacement: 'frigo' },
      { id: 'p2', nom: 'Lait', emplacement: 'frigo' },
    ],
    expirants: [{ id: 'p1', nom: 'Yaourt' }],
    loading: false,
  })),
}))

vi.mock('../src/hooks/useRepas', () => ({
  useRepas: vi.fn(() => ({
    idees: [
      { id: 'r1', nom: 'Pasta', type: 'dîner', fait: false },
      { id: 'r2', nom: 'Salade', type: 'déjeuner', fait: false },
      { id: 'r3', nom: 'Soupe', type: 'autre', fait: true },
    ],
    loading: false,
  })),
}))

vi.mock('../src/hooks/useMenage', () => ({
  useMenage: vi.fn(() => ({
    taches: [
      { id: 't1', nom: 'Aspirateur', frequence: 'hebdomadaire', fait: false },
      { id: 't2', nom: 'Vaisselle', frequence: 'quotidien', fait: true },
      { id: 't3', nom: 'Vitres', frequence: 'mensuel', fait: false },
    ],
    loading: false,
  })),
}))

vi.mock('../src/hooks/useDepenses', () => ({
  useDepenses: vi.fn(() => ({ depenses: [], loading: false })),
}))

describe('useDashboardSummary', () => {
  beforeEach(() => vi.clearAllMocks())

  // ── Courses ──
  it('courses subtitle shows unchecked count', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.courses.subtitle).toBe('1 à acheter')
  })

  it('courses badge is null', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.courses.badge).toBeNull()
  })

  // ── Frigo ──
  it('frigo subtitle shows expiring count', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.frigo.subtitle).toBe('1 expirent bientôt')
  })

  it('frigo badge shows expiring count when > 0', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.frigo.badge).toBe(1)
  })

  it('frigo alertMessage is set when expirants > 0', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.frigo.alertMessage).toBe('1 produit expire dans 3 jours ou moins')
  })

  // ── Repas ──
  it('repas subtitle shows total idees count', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.repas.subtitle).toBe('3 idée(s)')
  })

  it('repas badge is null', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.repas.badge).toBeNull()
  })

  it('repas subtitle shows "Aucune idée" when idees is empty', () => {
    vi.mocked(useRepas).mockReturnValueOnce({ idees: [], loading: false })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.repas.subtitle).toBe('Aucune idée')
  })

  // ── Ménage ──
  it('menage subtitle shows pending count', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.menage.subtitle).toBe('2 à faire')
  })

  it('menage badge shows pending count when > 0', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.menage.badge).toBe(2)
  })

  it('menage subtitle shows "Tout est propre ✨" when all done', () => {
    vi.mocked(useMenage).mockReturnValueOnce({
      taches: [{ id: 't1', fait: true }],
      loading: false,
    })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.menage.subtitle).toBe('Tout est propre ✨')
  })

  it('menage badge is null when all tasks are done', () => {
    vi.mocked(useMenage).mockReturnValueOnce({
      taches: [{ id: 't1', fait: true }],
      loading: false,
    })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.menage.badge).toBeNull()
  })

  // ── Dépenses ──
  it('depenses subtitle shows "Aucune dépense" when empty', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.depenses.subtitle).toBe('Aucune dépense')
  })

  it('depenses subtitle shows total when depenses exist', () => {
    vi.mocked(useDepenses).mockReturnValueOnce({
      depenses: [
        { id: 'd1', montant: 20.00 },
        { id: 'd2', montant: 35.50 },
      ],
      loading: false,
    })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.depenses.subtitle).toBe('55.50 €')
  })

  it('depenses badge is null', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.depenses.badge).toBeNull()
  })
})
