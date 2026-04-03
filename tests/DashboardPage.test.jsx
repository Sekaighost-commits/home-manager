import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardPage from '../src/pages/DashboardPage'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
    user: { uid: 'uid-yves' },
  }),
}))

vi.mock('../src/hooks/useDashboardSummary', () => ({
  useDashboardSummary: vi.fn(() => ({
    courses: { subtitle: '2 à acheter', badge: null },
    frigo: { subtitle: '1 expirent bientôt', badge: 1, alertMessage: '1 produit expire dans 3 jours ou moins' },
    repas: { subtitle: '3 idée(s)', badge: null },
    menage: { subtitle: '2 à faire', badge: 2 },
    depenses: { subtitle: 'Aucune dépense', badge: null },
  })),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('DashboardPage', () => {
  it('displays greeting with user name', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText(/Bonjour Yves/)).toBeInTheDocument()
  })

  it('renders all 8 module cards', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Repas')).toBeInTheDocument()
    expect(screen.getByText('Frigo')).toBeInTheDocument()
    expect(screen.getByText('Ménage')).toBeInTheDocument()
    expect(screen.getByText('Bricolage')).toBeInTheDocument()
    expect(screen.getByText('Dépenses')).toBeInTheDocument()
    expect(screen.getByText('Agenda')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('shows courses subtitle', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText('2 à acheter')).toBeInTheDocument()
  })

  it('shows repas subtitle on dashboard card', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText('3 idée(s)')).toBeInTheDocument()
  })

  it('shows menage subtitle on dashboard card', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText('2 à faire')).toBeInTheDocument()
  })

  it('shows menage badge on dashboard card', () => {
    wrap(<DashboardPage />)
    const badges = screen.getAllByText('2')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('shows depenses subtitle on dashboard card', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText('Aucune dépense')).toBeInTheDocument()
  })
})
