import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import NotesPage from '../src/pages/NotesPage'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddNote = vi.fn()
const mockUpdateNote = vi.fn()
const mockDeleteNote = vi.fn()

vi.mock('../src/hooks/useNotes', () => ({
  useNotes: () => ({
    notes: [
      { id: 'n1', contenu: 'Appeler le plombier', creePar: 'uid-yves', nomCreePar: 'Yves', couleurCreePar: '#2563eb', modifiePar: null },
      { id: 'n2', contenu: 'Acheter des fleurs', creePar: 'uid-yves', nomCreePar: 'Yves', couleurCreePar: '#2563eb', modifiePar: null },
    ],
    loading: false,
    addNote: mockAddNote,
    updateNote: mockUpdateNote,
    deleteNote: mockDeleteNote,
  }),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('NotesPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the page title', () => {
    wrap(<NotesPage />)
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('renders all notes', () => {
    wrap(<NotesPage />)
    expect(screen.getByText('Appeler le plombier')).toBeInTheDocument()
    expect(screen.getByText('Acheter des fleurs')).toBeInTheDocument()
  })

  it('has a textarea with placeholder "Nouvelle note…"', () => {
    wrap(<NotesPage />)
    expect(screen.getByLabelText(/nouvelle note/i)).toBeInTheDocument()
  })

  it('calls addNote when form is submitted', async () => {
    wrap(<NotesPage />)
    fireEvent.change(screen.getByLabelText(/nouvelle note/i), {
      target: { value: 'Penser aux vacances' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAddNote).toHaveBeenCalledWith({
        contenu: 'Penser aux vacances',
        creePar: 'uid-yves',
        nomCreePar: 'Yves',
        couleurCreePar: '#2563eb',
      })
    )
  })

  it('clicking edit button shows a textarea with current content', () => {
    wrap(<NotesPage />)
    const editBtns = screen.getAllByRole('button', { name: /éditer/i })
    fireEvent.click(editBtns[0])
    expect(screen.getByLabelText(/modifier/i)).toHaveValue('Appeler le plombier')
  })

  it('calls updateNote when save button is clicked', async () => {
    wrap(<NotesPage />)
    fireEvent.click(screen.getAllByRole('button', { name: /éditer/i })[0])
    const textarea = screen.getByLabelText(/modifier/i)
    fireEvent.change(textarea, { target: { value: 'Appeler le plombier demain' } })
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))
    await waitFor(() =>
      expect(mockUpdateNote).toHaveBeenCalledWith('n1', 'Appeler le plombier demain', 'uid-yves')
    )
  })

  it('hides edit textarea when cancel is clicked', () => {
    wrap(<NotesPage />)
    fireEvent.click(screen.getAllByRole('button', { name: /éditer/i })[0])
    expect(screen.getByLabelText(/modifier/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
    expect(screen.queryByLabelText(/modifier/i)).not.toBeInTheDocument()
  })

  it('calls deleteNote when delete button is clicked', async () => {
    wrap(<NotesPage />)
    const deletes = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(deletes[0])
    await waitFor(() => expect(mockDeleteNote).toHaveBeenCalledWith('n1'))
  })
})
