import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MenagePage from '../src/pages/MenagePage'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockAddTache = vi.fn()
const mockToggleTache = vi.fn()
const mockDeleteTache = vi.fn()

vi.mock('../src/hooks/useMenage', () => ({
  useMenage: () => ({
    taches: [
      { id: 't1', nom: "Passer l'aspirateur", frequence: 'hebdomadaire', fait: false, faitPar: null, faitParNom: null, ajoutePar: 'uid-yves' },
      { id: 't2', nom: 'Faire la vaisselle', frequence: 'quotidien', fait: true, faitPar: 'uid-yves', faitParNom: 'Yves', ajoutePar: 'uid-yves' },
      { id: 't3', nom: 'Nettoyer les vitres', frequence: 'mensuel', fait: false, faitPar: null, faitParNom: null, ajoutePar: 'uid-yves' },
    ],
    loading: false,
    addTache: mockAddTache,
    toggleTache: mockToggleTache,
    deleteTache: mockDeleteTache,
  }),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('MenagePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the page title', () => {
    wrap(<MenagePage />)
    expect(screen.getByText('Ménage')).toBeInTheDocument()
  })

  it('renders all taches', () => {
    wrap(<MenagePage />)
    expect(screen.getByText("Passer l'aspirateur")).toBeInTheDocument()
    expect(screen.getByText('Faire la vaisselle')).toBeInTheDocument()
    expect(screen.getByText('Nettoyer les vitres')).toBeInTheDocument()
  })

  it('shows filter pills', () => {
    wrap(<MenagePage />)
    expect(screen.getByText('Tout')).toBeInTheDocument()
    expect(screen.getByText('Quotidien')).toBeInTheDocument()
    expect(screen.getByText('Hebdomadaire')).toBeInTheDocument()
    expect(screen.getByText('Mensuel')).toBeInTheDocument()
  })

  it('filters by frequence when pill is clicked', () => {
    wrap(<MenagePage />)
    fireEvent.click(screen.getByText('Hebdomadaire'))
    expect(screen.getByText("Passer l'aspirateur")).toBeInTheDocument()
    expect(screen.queryByText('Faire la vaisselle')).not.toBeInTheDocument()
    expect(screen.queryByText('Nettoyer les vitres')).not.toBeInTheDocument()
  })

  it('has a form with role="form"', () => {
    wrap(<MenagePage />)
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('has an input with placeholder "Ajouter une tâche…"', () => {
    wrap(<MenagePage />)
    expect(screen.getByPlaceholderText('Ajouter une tâche…')).toBeInTheDocument()
  })

  it('has a select for frequence', () => {
    wrap(<MenagePage />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls addTache when form is submitted', async () => {
    wrap(<MenagePage />)
    fireEvent.change(screen.getByPlaceholderText('Ajouter une tâche…'), {
      target: { value: 'Sortir les poubelles' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() =>
      expect(mockAddTache).toHaveBeenCalledWith({
        nom: 'Sortir les poubelles',
        frequence: 'hebdomadaire',
        ajoutePar: 'uid-yves',
      })
    )
  })

  it('calls toggleTache when check button is clicked on pending tache', async () => {
    wrap(<MenagePage />)
    const checks = screen.getAllByRole('button', { name: /toggle/i })
    fireEvent.click(checks[0])
    await waitFor(() =>
      expect(mockToggleTache).toHaveBeenCalledWith('t1', true, 'uid-yves', 'Yves')
    )
  })

  it('calls toggleTache to uncheck when check button is clicked on done tache', async () => {
    wrap(<MenagePage />)
    const checks = screen.getAllByRole('button', { name: /toggle/i })
    const doneCheck = checks.find((_, i) => {
      const all = screen.getAllByRole('button', { name: /toggle/i })
      return all[i].className.includes('checked')
    })
    fireEvent.click(doneCheck)
    await waitFor(() =>
      expect(mockToggleTache).toHaveBeenCalledWith('t2', false, 'uid-yves', 'Yves')
    )
  })

  it('calls deleteTache when delete button is clicked', async () => {
    wrap(<MenagePage />)
    const deletes = screen.getAllByRole('button', { name: /supprimer/i })
    fireEvent.click(deletes[0])
    await waitFor(() => expect(mockDeleteTache).toHaveBeenCalledWith('t1'))
  })

  it('shows avatar with initials when tache is done', () => {
    wrap(<MenagePage />)
    expect(screen.getByText('YV')).toBeInTheDocument()
  })
})
