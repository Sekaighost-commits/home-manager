import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ModuleCard from '../src/components/ModuleCard'
import { MemoryRouter } from 'react-router-dom'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ModuleCard', () => {
  it('renders icon and name', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" />)
    expect(screen.getByText('🛒')).toBeInTheDocument()
    expect(screen.getByText('Courses')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" subtitle="5 articles" />)
    expect(screen.getByText('5 articles')).toBeInTheDocument()
  })

  it('renders badge when badge > 0', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" badge={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not render badge when badge is null', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" badge={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
