import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RepasPage from '../src/pages/RepasPage'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddIdee = vi.fn()
const mockToggleIdee = vi.fn()
const mockDeleteIdee = vi.fn()
const mockClearCuisinees = vi.fn()

vi.mock('../src/hooks/useRepas', () => ({
  useRepas: () => ({
    idees: [
      { id: 'r1', nom: 'Pasta Bolognese', type: 'dîner', fait: false, ajoutePar: 'uid-yves' },
      { id: 'r2', nom: 'Salade César', type: 'déjeuner', fait: true, ajoutePar: 'uid-yves' },
      { id: 'r3', nom: 'Soupe de légumes', type: 'autre', fait: false, ajoutePar: 'uid-yves' },
    ],
    loading: false,
    addIdee: mockAddIdee,
    toggleIdee: mockToggleIdee,
    deleteIdee: mockDeleteIdee,
    clearCuisinees: mockClearCuisinees,
  }),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('RepasPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the page title', () => {
    wrap(<RepasPage />)
    expect(screen.getByText('Idées Repas')).toBeInTheDocument()
  })

  it('renders all idees', () => {
    wrap(<RepasPage />)
    expect(screen.getByText('Pasta Bolognese')).toBeInTheDocument()
    expect(screen.getByText('Salade César')).toBeInTheDocument()
    expect(screen.getByText('Soupe de légumes')).toBeInTheDocument()
  })

  it('shows filter pills', () => {
    wrap(<RepasPage />)
    expect(screen.getByText('Tout')).toBeInTheDocument()
    expect(screen.getByText('Déjeuner')).toBeInTheDocument()
    expect(screen.getByText('Dîner')).toBeInTheDocument()
    expect(screen.getByText('Autre')).toBeInTheDocument()
  })

  it('filters by type when pill is clicked', () => {
    wrap(<RepasPage />)
    fireEvent.click(screen.getByText('Dîner'))
    expect(screen.getByText('Pasta Bolognese')).toBeInTheDocument()
    expect(screen.queryByText('Salade César')).not.toBeInTheDocument()
    expect(screen.queryByText('Soupe de légumes')).not.toBeInTheDocument()
  })

  it('shows "Vider les cuisinées" when there are cuisinées', () => {
    wrap(<RepasPage />)
    expect(screen.getByText(/vider les cuisin/i)).toBeInTheDocument()
  })

  it('calls clearCuisinees when button is clicked', async () => {
    wrap(<RepasPage />)
    fireEvent.click(screen.getByText(/vider les cuisin/i))
    await waitFor(() => expect(mockClearCuisinees).toHaveBeenCalledOnce())
  })

  it('has a form with role="form"', () => {
    wrap(<RepasPage />)
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('has an input with placeholder "Ajouter une idée…"', () => {
    wrap(<RepasPage />)
    expect(screen.getByPlaceholderText('Ajouter une idée…')).toBeInTheDocument()
  })

  it('has a select for type', () => {
    wrap(<RepasPage />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls addIdee when form is submitted', async () => {
    wrap(<RepasPage />)
    fireEvent.change(screen.getByPlaceholderText('Ajouter une idée…'), {
      target: { value: 'Ratatouille' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAddIdee).toHaveBeenCalledWith({
        nom: 'Ratatouille',
        type: 'dîner',
        ajoutePar: 'uid-yves',
      })
    )
  })

  it('calls toggleIdee when check button is clicked', async () => {
    wrap(<RepasPage />)
    const checks = screen.getAllByRole('button', { name: /toggle/i })
    fireEvent.click(checks[0])
    await waitFor(() => expect(mockToggleIdee).toHaveBeenCalledWith('r1', true))
  })

  it('calls deleteIdee when delete button is clicked', async () => {
    wrap(<RepasPage />)
    const deletes = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(deletes[0])
    await waitFor(() => expect(mockDeleteIdee).toHaveBeenCalledWith('r1'))
  })
})
