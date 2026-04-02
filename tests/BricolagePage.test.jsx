import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import BricolagePage from '../src/pages/BricolagePage'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddTravail = vi.fn()
const mockUpdateStatut = vi.fn()
const mockDeleteTravail = vi.fn()

vi.mock('../src/hooks/useBricolage', () => ({
  useBricolage: () => ({
    travaux: [
      { id: 'b1', titre: 'Réparer robinet', notes: 'Cuisine', priorite: 'urgent', statut: 'todo', createdBy: 'uid-yves' },
      { id: 'b2', titre: 'Peindre salon', notes: '', priorite: 'normal', statut: 'inprogress', createdBy: 'uid-yves' },
      { id: 'b3', titre: 'Changer ampoule', notes: '', priorite: 'low', statut: 'done', createdBy: 'uid-yves' },
    ],
    loading: false,
    addTravail: mockAddTravail,
    updateStatut: mockUpdateStatut,
    deleteTravail: mockDeleteTravail,
  }),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('BricolagePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the page title', () => {
    wrap(<BricolagePage />)
    expect(screen.getByText('Bricolage')).toBeInTheDocument()
  })

  it('renders all travaux', () => {
    wrap(<BricolagePage />)
    expect(screen.getByText('Réparer robinet')).toBeInTheDocument()
    expect(screen.getByText('Peindre salon')).toBeInTheDocument()
    expect(screen.getByText('Changer ampoule')).toBeInTheDocument()
  })

  it('shows filter pills', () => {
    wrap(<BricolagePage />)
    expect(screen.getByRole('button', { name: 'Tout' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'À faire' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'En cours' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Terminé' })).toBeInTheDocument()
  })

  it('filters by statut when pill is clicked', () => {
    wrap(<BricolagePage />)
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }))
    expect(screen.getByText('Réparer robinet')).toBeInTheDocument()
    expect(screen.queryByText('Peindre salon')).not.toBeInTheDocument()
    expect(screen.queryByText('Changer ampoule')).not.toBeInTheDocument()
  })

  it('has a form with role="form"', () => {
    wrap(<BricolagePage />)
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('has an input with placeholder "Titre du travail…"', () => {
    wrap(<BricolagePage />)
    expect(screen.getByPlaceholderText('Titre du travail…')).toBeInTheDocument()
  })

  it('has a select for priorité', () => {
    wrap(<BricolagePage />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls addTravail when form is submitted', async () => {
    wrap(<BricolagePage />)
    fireEvent.change(screen.getByPlaceholderText('Titre du travail…'), {
      target: { value: 'Fixer étagère' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAddTravail).toHaveBeenCalledWith({
        titre: 'Fixer étagère',
        notes: '',
        priorite: 'normal',
        createdBy: 'uid-yves',
      })
    )
  })

  it('calls updateStatut when Démarrer button is clicked', async () => {
    wrap(<BricolagePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Démarrer' }))
    await waitFor(() => expect(mockUpdateStatut).toHaveBeenCalledWith('b1', 'inprogress'))
  })

  it('calls updateStatut when Terminer button is clicked', async () => {
    wrap(<BricolagePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Terminer' }))
    await waitFor(() => expect(mockUpdateStatut).toHaveBeenCalledWith('b2', 'done'))
  })

  it('calls updateStatut when Rouvrir button is clicked', async () => {
    wrap(<BricolagePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Rouvrir' }))
    await waitFor(() => expect(mockUpdateStatut).toHaveBeenCalledWith('b3', 'todo'))
  })

  it('calls deleteTravail when delete button is clicked', async () => {
    wrap(<BricolagePage />)
    const deletes = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(deletes[0])
    await waitFor(() => expect(mockDeleteTravail).toHaveBeenCalledWith('b1'))
  })
})
