import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AgendaPage from '../src/pages/AgendaPage'
import { useAgenda } from '../src/hooks/useAgenda'
import { useFoyerMembers } from '../src/hooks/useFoyerMembers'

// Fix today to 2026-04-15 for stable tests
beforeAll(() => vi.setSystemTime(new Date('2026-04-15T12:00:00')))
afterAll(() => vi.useRealTimers())

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAdd = vi.fn()
const mockDelete = vi.fn()

vi.mock('../src/hooks/useAgenda', () => ({
  useAgenda: vi.fn(() => ({
    evenements: [],
    loading: false,
    addEvenement: mockAdd,
    deleteEvenement: mockDelete,
  })),
}))

vi.mock('../src/hooks/useFoyerMembers', () => ({
  useFoyerMembers: vi.fn(() => ({
    membres: [
      { uid: 'uid-yves', nom: 'Yves', couleur: '#2563eb' },
      { uid: 'uid-sara', nom: 'Sara', couleur: '#16a34a' },
    ],
    loading: false,
  })),
}))

const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('AgendaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAgenda).mockReturnValue({
      evenements: [],
      loading: false,
      addEvenement: mockAdd,
      deleteEvenement: mockDelete,
    })
    vi.mocked(useFoyerMembers).mockReturnValue({
      membres: [
        { uid: 'uid-yves', nom: 'Yves', couleur: '#2563eb' },
        { uid: 'uid-sara', nom: 'Sara', couleur: '#16a34a' },
      ],
      loading: false,
    })
  })

  it('renders the page title', () => {
    wrap(<AgendaPage />)
    expect(screen.getByText('Agenda')).toBeInTheDocument()
  })

  it('renders a calendar grid (not a list)', () => {
    const { container } = wrap(<AgendaPage />)
    expect(container.querySelector('.calendar-grid')).toBeInTheDocument()
  })

  it('shows current month name in calendar header', () => {
    wrap(<AgendaPage />)
    expect(screen.getByText(/avril 2026/i)).toBeInTheDocument()
  })

  it('opens the sheet when a day is clicked', () => {
    const { container } = wrap(<AgendaPage />)
    const sheet = container.querySelector('.sheet-content')
    expect(sheet).not.toHaveClass('sheet-content--open')
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    expect(sheet).toHaveClass('sheet-content--open')
  })

  it('shows empty state when no events on selected day', () => {
    const { container } = wrap(<AgendaPage />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    expect(screen.getByText(/aucun évènement ce jour/i)).toBeInTheDocument()
  })

  it('shows events for the selected day', () => {
    vi.mocked(useAgenda).mockReturnValue({
      evenements: [
        { id: 'e1', titre: 'Dentiste', date: '2026-04-15', ajoutePar: 'uid-yves', commun: false },
      ],
      loading: false,
      addEvenement: mockAdd,
      deleteEvenement: mockDelete,
    })
    const { container } = wrap(<AgendaPage />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    expect(screen.getByText('Dentiste')).toBeInTheDocument()
  })

  it('submits a personal event for the selected day', async () => {
    const { container } = wrap(<AgendaPage />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    fireEvent.change(screen.getByPlaceholderText(/titre/i), { target: { value: 'Dentiste' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAdd).toHaveBeenCalledWith({
        titre: 'Dentiste',
        date: '2026-04-15',
        ajoutePar: 'uid-yves',
        commun: false,
      })
    )
  })

  it('submits a common event when "Nous deux" checkbox is checked', async () => {
    const { container } = wrap(<AgendaPage />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    fireEvent.change(screen.getByPlaceholderText(/titre/i), { target: { value: 'Dîner en famille' } })
    fireEvent.click(screen.getByLabelText(/nous deux/i))
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAdd).toHaveBeenCalledWith({
        titre: 'Dîner en famille',
        date: '2026-04-15',
        ajoutePar: 'uid-yves',
        commun: true,
      })
    )
  })

  it('does not call addEvenement when titre is empty', async () => {
    const { container } = wrap(<AgendaPage />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAdd).not.toHaveBeenCalled())
  })

  it('calls deleteEvenement when × is clicked', async () => {
    vi.mocked(useAgenda).mockReturnValue({
      evenements: [
        { id: 'e1', titre: 'Dentiste', date: '2026-04-15', ajoutePar: 'uid-yves', commun: false },
      ],
      loading: false,
      addEvenement: mockAdd,
      deleteEvenement: mockDelete,
    })
    const { container } = wrap(<AgendaPage />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('e1'))
  })

  it('shows loading guard while loading', () => {
    vi.mocked(useAgenda).mockReturnValueOnce({ evenements: [], loading: true, addEvenement: mockAdd, deleteEvenement: mockDelete })
    const { container } = wrap(<AgendaPage />)
    expect(screen.queryByText('Agenda')).not.toBeInTheDocument()
    expect(container.querySelector('.module-page')).toBeInTheDocument()
  })
})
