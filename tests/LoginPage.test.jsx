import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../src/pages/LoginPage'

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'uid-yves' } })
  ),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'foyer-123' })),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  arrayUnion: vi.fn((v) => [v]),
  updateDoc: vi.fn(() => Promise.resolve()),
}))

describe('LoginPage', () => {
  it('renders connexion tab by default', () => {
    render(<LoginPage />)
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('switches to signup tab when clicked', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('Créer un compte'))
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
  })

  it('shows error on empty login submit', async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows color picker on signup tab', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('Créer un compte'))
    expect(screen.getByText(/couleur/i)).toBeInTheDocument()
  })
})
