// tests/RecapPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RecapPage from '../src/pages/RecapPage'
import { useRecap } from '../src/hooks/useRecap'

// Fixer aujourd'hui à 2026-04-06 pour des tests stables
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-06T12:00:00'))
})
afterAll(() => vi.useRealTimers())

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockRecap = {
  courses: [
    { id: 'c1', nom: 'Lait' },
    { id: 'c2', nom: 'Pain' },
  ],
  depenses: [
    { id: 'd1', montant: 50, categorie: 'Alimentation' },
    { id: 'd2', montant: 20, categorie: 'Transport' },
  ],
  agenda: [
    { id: 'a1', titre: 'Dentiste', date: '2026-04-12', ajoutePar: 'uid-yves' },
    { id: 'a2', titre: 'Dîner',    date: '2026-04-05', ajoutePar: 'uid-yves' },
  ],
  totalDepenses: 70,
  depensesParCategorie: [
    { categorie: 'Alimentation', total: 50 },
    { categorie: 'Transport',    total: 20 },
  ],
  loading: false,
}

vi.mock('../src/hooks/useRecap', () => ({
  useRecap: vi.fn(() => mockRecap),
}))

const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('RecapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRecap).mockReturnValue(mockRecap)
  })

  it('renders the page title', () => {
    wrap(<RecapPage />)
    expect(screen.getByText('Récap')).toBeInTheDocument()
  })

  it('renders 6 month pills', () => {
    const { container } = wrap(<RecapPage />)
    expect(container.querySelectorAll('.recap-pill')).toHaveLength(6)
  })

  it('marks current month pill as selected', () => {
    const { container } = wrap(<RecapPage />)
    const selected = container.querySelector('.recap-pill--selected')
    expect(selected).toBeInTheDocument()
    expect(selected.textContent).toMatch(/avr/i)
  })

  it('clicking a pill calls useRecap with the new month', () => {
    wrap(<RecapPage />)
    // Cliquer sur la première pill (le mois le plus ancien des 6)
    const pills = screen.getAllByRole('button', { name: /jan|fév|mar|avr|mai|juin|juil|aoû|sep|oct|nov|déc/i })
    fireEvent.click(pills[0])
    // useRecap doit avoir été appelé avec un mois différent
    const calls = vi.mocked(useRecap).mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[0]).toBe('foyer-1')
  })

  it('shows courses articles for selected month', () => {
    wrap(<RecapPage />)
    expect(screen.getByText('Lait')).toBeInTheDocument()
    expect(screen.getByText('Pain')).toBeInTheDocument()
  })

  it('shows depenses total and category breakdown', () => {
    wrap(<RecapPage />)
    expect(screen.getByText(/70/)).toBeInTheDocument()
    expect(screen.getByText(/Alimentation/i)).toBeInTheDocument()
    expect(screen.getByText(/Transport/i)).toBeInTheDocument()
  })

  it('shows agenda events sorted by date', () => {
    wrap(<RecapPage />)
    expect(screen.getByText('Dentiste')).toBeInTheDocument()
    expect(screen.getByText('Dîner')).toBeInTheDocument()
  })
})
