import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import FrigoPage from '../src/pages/FrigoPage'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddProduit = vi.fn()

vi.mock('../src/hooks/useFrigo', () => ({
  useFrigo: () => ({
    produits: [
      { id: 'p1', nom: 'Yaourt', quantite: '4', emplacement: 'frigo', dateExpiration: null, ajoutePar: 'uid-yves' },
      { id: 'p2', nom: 'Glace', quantite: '1', emplacement: 'congelateur', dateExpiration: null, ajoutePar: 'uid-yves' },
    ],
    loading: false,
    addProduit: mockAddProduit,
    deleteProduit: vi.fn(),
    expirants: [],
  }),
  getExpiryStatus: vi.fn(() => null),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('FrigoPage', () => {
  it('renders the page title', () => {
    wrap(<FrigoPage />)
    expect(screen.getByText('Frigo')).toBeInTheDocument()
  })

  it('renders all products by default', () => {
    wrap(<FrigoPage />)
    expect(screen.getByText('Yaourt')).toBeInTheDocument()
    expect(screen.getByText('Glace')).toBeInTheDocument()
  })

  it('filters by emplacement when pill is clicked', () => {
    wrap(<FrigoPage />)
    fireEvent.click(screen.getByText('Congélateur'))
    expect(screen.getByText('Glace')).toBeInTheDocument()
    expect(screen.queryByText('Yaourt')).not.toBeInTheDocument()
  })

  it('calls addProduit when form is submitted', async () => {
    wrap(<FrigoPage />)
    fireEvent.click(screen.getByText('＋'))
    fireEvent.change(screen.getByPlaceholderText(/ajouter un produit/i), { target: { value: 'Lait' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAddProduit).toHaveBeenCalledWith(expect.objectContaining({ nom: 'Lait' })))
  })
})
