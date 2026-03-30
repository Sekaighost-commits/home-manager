import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'

vi.mock('../src/firebase.js', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null)
    return vi.fn()
  }),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}))

function TestConsumer() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div>loading</div>
  return (
    <div>
      <span data-testid="user">{user ? 'connected' : 'disconnected'}</span>
      <span data-testid="profile">{profile ? profile.nom : 'no-profile'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides disconnected state when no user is logged in', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('disconnected')
      expect(screen.getByTestId('profile').textContent).toBe('no-profile')
    })
  })
})
