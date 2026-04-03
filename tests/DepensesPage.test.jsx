import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import DepensesPage from '../src/pages/DepensesPage'
import { useDepenses } from '../src/hooks/useDepenses'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', foyerId: 'foyer-1' },
  }),
}))

const mockAdd = vi.fn()
const mockDelete = vi.fn()

const SAMPLE = [
  { id: 'd1', description: 'Essence', montant: 55.40, categorie: 'Transport', ajoutePar: 'uid-yves' },
  { id: 'd2', description: 'Pizza', montant: 22.00, categorie: 'Restaurant', ajoutePar: 'uid-yves' },
]

vi.mock('../src/hooks/useDepenses', () => ({
  useDepenses: vi.fn(() => ({
    depenses: SAMPLE,
    loading: false,
    addDepense: mockAdd,
    deleteDepense: mockDelete,
  })),
}))

const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('DepensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDepenses).mockReturnValue({
      depenses: SAMPLE,
      loading: false,
      addDepense: mockAdd,
      deleteDepense: mockDelete,
    })
  })

  it('renders the page title', () => {
    wrap(<DepensesPage />)
    expect(screen.getByText('Dépenses')).toBeInTheDocument()
  })

  it('renders all depenses', () => {
    wrap(<DepensesPage />)
    expect(screen.getByText('Essence')).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('renders montant formatted with 2 decimals', () => {
    wrap(<DepensesPage />)
    expect(screen.getByText(/55\.40/)).toBeInTheDocument()
  })

  it('shows empty state when no depenses', () => {
    vi.mocked(useDepenses).mockReturnValueOnce({
      depenses: [], loading: false, addDepense: mockAdd, deleteDepense: mockDelete,
    })
    wrap(<DepensesPage />)
    expect(screen.getByText('Aucune dépense')).toBeInTheDocument()
  })

  it('renders loading guard while loading', () => {
    vi.mocked(useDepenses).mockReturnValueOnce({
      depenses: [], loading: true, addDepense: mockAdd, deleteDepense: mockDelete,
    })
    const { container } = wrap(<DepensesPage />)
    expect(screen.queryByText('Dépenses')).not.toBeInTheDocument()
    expect(container.querySelector('.module-page')).toBeInTheDocument()
  })

  it('shows filter pills including Tout and categories', () => {
    wrap(<DepensesPage />)
    expect(screen.getByText('Tout')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
  })

  it('filters by category when pill is clicked', () => {
    wrap(<DepensesPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Transport' }))
    expect(screen.getByText('Essence')).toBeInTheDocument()
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument()
  })

  it('calls deleteDepense with correct id when delete is clicked', async () => {
    wrap(<DepensesPage />)
    const deletes = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(deletes[0])
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('d1'))
  })

  it('calls addDepense when form is submitted with valid inputs', async () => {
    wrap(<DepensesPage />)
    fireEvent.change(screen.getByPlaceholderText('Description…'), { target: { value: 'Ciné' } })
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '12.50' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAdd).toHaveBeenCalledOnce())
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Ciné', montant: 12.50 })
    )
  })

  it('does not call addDepense when description is empty', async () => {
    wrap(<DepensesPage />)
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAdd).not.toHaveBeenCalled())
  })

  it('does not call addDepense when montant is 0 or empty', async () => {
    wrap(<DepensesPage />)
    fireEvent.change(screen.getByPlaceholderText('Description…'), { target: { value: 'Test' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAdd).not.toHaveBeenCalled())
  })
})
