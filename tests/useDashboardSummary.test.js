import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardSummary } from '../src/hooks/useDashboardSummary'
import { useRepas } from '../src/hooks/useRepas'
import { useMenage } from '../src/hooks/useMenage'
import { useBricolage } from '../src/hooks/useBricolage'
import { useNotes } from '../src/hooks/useNotes'
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

vi.mock('../src/hooks/useBricolage', () => ({
  useBricolage: vi.fn(() => ({
    travaux: [
      { id: 'b1', titre: 'Réparer robinet', priorite: 'urgent', statut: 'todo' },
      { id: 'b2', titre: 'Peindre salon', priorite: 'normal', statut: 'inprogress' },
      { id: 'b3', titre: 'Changer ampoule', priorite: 'low', statut: 'done' },
    ],
    loading: false,
  })),
}))

vi.mock('../src/hooks/useNotes', () => ({
  useNotes: vi.fn(() => ({
    notes: [
      { id: 'n1', contenu: 'Appeler le plombier' },
      { id: 'n2', contenu: 'Acheter des fleurs' },
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

  // ── Bricolage ──
  it('bricolage subtitle shows urgent count when urgents exist', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.bricolage.subtitle).toBe('1 urgent(s)')
  })

  it('bricolage badge shows urgent count', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.bricolage.badge).toBe(1)
  })

  it('bricolage subtitle shows active count when no urgents', () => {
    vi.mocked(useBricolage).mockReturnValueOnce({
      travaux: [
        { id: 'b1', priorite: 'normal', statut: 'todo' },
        { id: 'b2', priorite: 'low', statut: 'inprogress' },
      ],
      loading: false,
    })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.bricolage.subtitle).toBe('2 en cours')
  })

  it('bricolage subtitle shows "Tout est fait" when all done', () => {
    vi.mocked(useBricolage).mockReturnValueOnce({
      travaux: [{ id: 'b1', priorite: 'normal', statut: 'done' }],
      loading: false,
    })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.bricolage.subtitle).toBe('Tout est fait')
  })

  // ── Notes ──
  it('notes subtitle shows total count', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.notes.subtitle).toBe('2 note(s)')
  })

  it('notes badge is null', () => {
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.notes.badge).toBeNull()
  })

  it('notes subtitle shows "Aucune note" when empty', () => {
    vi.mocked(useNotes).mockReturnValueOnce({ notes: [], loading: false })
    const { result } = renderHook(() => useDashboardSummary('foyer-1'))
    expect(result.current.notes.subtitle).toBe('Aucune note')
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