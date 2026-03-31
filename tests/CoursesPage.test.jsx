import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CoursesPage from '../src/pages/CoursesPage'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddArticle = vi.fn()
const mockToggleArticle = vi.fn()
const mockClearDone = vi.fn()

vi.mock('../src/hooks/useCourses', () => ({
  useCourses: () => ({
    articles: [
      { id: 'a1', nom: 'Lait', categorie: 'Frais', fait: false, ajoutePar: 'uid-yves' },
      { id: 'a2', nom: 'Pain', categorie: 'Épicerie', fait: true, ajoutePar: 'uid-yves' },
    ],
    loading: false,
    addArticle: mockAddArticle,
    toggleArticle: mockToggleArticle,
    deleteArticle: vi.fn(),
    clearDone: mockClearDone,
  }),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('CoursesPage', () => {
  it('renders the page title', () => {
    wrap(<CoursesPage />)
    expect(screen.getByText('Courses')).toBeInTheDocument()
  })

  it('renders unchecked articles', () => {
    wrap(<CoursesPage />)
    expect(screen.getByText('Lait')).toBeInTheDocument()
  })

  it('renders checked articles in done section', () => {
    wrap(<CoursesPage />)
    expect(screen.getByText('Pain')).toBeInTheDocument()
  })

  it('shows "Vider les cochés" when there are done articles', () => {
    wrap(<CoursesPage />)
    expect(screen.getByText(/vider les coch/i)).toBeInTheDocument()
  })

  it('calls clearDone when "Vider les cochés" is clicked', async () => {
    wrap(<CoursesPage />)
    fireEvent.click(screen.getByText(/vider les coch/i))
    await waitFor(() => expect(mockClearDone).toHaveBeenCalledOnce())
  })

  it('calls addArticle when form is submitted', async () => {
    wrap(<CoursesPage />)
    fireEvent.change(screen.getByPlaceholderText(/ajouter/i), { target: { value: 'Beurre' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockAddArticle).toHaveBeenCalledWith({
      nom: 'Beurre',
      categorie: expect.any(String),
      ajoutePar: 'uid-yves',
    }))
  })
})
