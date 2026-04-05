import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AgendaPage from '../src/pages/AgendaPage'
import { useAgenda } from '../src/hooks/useAgenda'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddEvenement = vi.fn()
const mockDeleteEvenement = vi.fn()

const SAMPLE_EVENTS = [
  { id: 'e1', titre: 'Anniversaire de Enza', date: '2026-04-20', ajoutePar: 'uid-yves' },
  { id: 'e2', titre: 'Réunion école', date: '2026-05-03', ajoutePar: 'uid-yves' },
]

vi.mock('../src/hooks/useAgenda', () => ({
  useAgenda: vi.fn(() => ({
    evenements: SAMPLE_EVENTS,
    loading: false,
    addEvenement: mockAddEvenement,
    deleteEvenement: mockDeleteEvenement,
  })),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('AgendaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAgenda).mockReturnValue({
      evenements: SAMPLE_EVENTS,
      loading: false,
      addEvenement: mockAddEvenement,
      deleteEvenement: mockDeleteEvenement,
    })
  })

  it('renders the page title', () => {
    wrap(<AgendaPage />)
    expect(screen.getByText('Agenda')).toBeInTheDocument()
  })

  it('renders all events', () => {
    wrap(<AgendaPage />)
    expect(screen.getByText('Anniversaire de Enza')).toBeInTheDocument()
    expect(screen.getByText('Réunion école')).toBeInTheDocument()
  })

  it('has a titre input and a date input', () => {
    wrap(<AgendaPage />)
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
  })

  it('calls addEvenement when form is submitted with valid data', async () => {
    wrap(<AgendaPage />)
    fireEvent.change(screen.getByLabelText(/titre/i), {
      target: { value: 'Dentiste' },
    })
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2026-06-01' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAddEvenement).toHaveBeenCalledWith({
        titre: 'Dentiste',
        date: '2026-06-01',
        ajoutePar: 'uid-yves',
      })
    )
  })

  it('does not call addEvenement when titre is empty', async () => {
    wrap(<AgendaPage />)
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2026-06-01' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAddEvenement).not.toHaveBeenCalled())
  })

  it('does not call addEvenement when date is empty', async () => {
    wrap(<AgendaPage />)
    fireEvent.change(screen.getByLabelText(/titre/i), {
      target: { value: 'Dentiste' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAddEvenement).not.toHaveBeenCalled())
  })

  it('calls deleteEvenement when delete button is clicked', async () => {
    wrap(<AgendaPage />)
    const deletes = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(deletes[0])
    await waitFor(() => expect(mockDeleteEvenement).toHaveBeenCalledWith('e1'))
  })

  it('shows empty state when no evenements', () => {
    vi.mocked(useAgenda).mockReturnValueOnce({
      evenements: [],
      loading: false,
      addEvenement: mockAddEvenement,
      deleteEvenement: mockDeleteEvenement,
    })
    wrap(<AgendaPage />)
    expect(screen.getByText('Aucun évènement')).toBeInTheDocument()
  })

  it('renders loading guard while loading', () => {
    vi.mocked(useAgenda).mockReturnValueOnce({
      evenements: [],
      loading: true,
      addEvenement: mockAddEvenement,
      deleteEvenement: mockDeleteEvenement,
    })
    const { container } = wrap(<AgendaPage />)
    expect(screen.queryByText('Agenda')).not.toBeInTheDocument()
    expect(container.querySelector('.module-page')).toBeInTheDocument()
  })
})
