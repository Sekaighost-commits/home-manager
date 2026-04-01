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
  useDashboardSummary: () => ({
    courses: { subtitle: '2 à acheter', badge: null },
    frigo: { subtitle: '5 produits', badge: null, alertMessage: null },
  }),
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
})
