import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlertBanner from '../src/components/AlertBanner'

describe('AlertBanner', () => {
  it('renders the message when provided', () => {
    render(<AlertBanner message="2 produits expirent bientôt" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('2 produits expirent bientôt')).toBeInTheDocument()
  })

  it('renders nothing when message is null', () => {
    const { container } = render(<AlertBanner message={null} />)
    expect(container.firstChild).toBeNull()
  })
})
