import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import CalendarGrid from '../src/components/CalendarGrid'

// Fixer "aujourd'hui" à 2026-04-15 pour des tests stables
beforeAll(() => vi.setSystemTime(new Date('2026-04-15T12:00:00')))
afterAll(() => vi.useRealTimers())

const baseProps = {
  currentMonth: { year: 2026, month: 3 }, // avril 2026 (0-indexé)
  events: [],
  colorMap: {},
  selectedDay: null,
  onDayClick: vi.fn(),
  onPrevMonth: vi.fn(),
  onNextMonth: vi.fn(),
}

describe('CalendarGrid', () => {
  beforeEach(() => vi.clearAllMocks())

  it('displays the month name and year', () => {
    render(<CalendarGrid {...baseProps} />)
    expect(screen.getByText(/avril 2026/i)).toBeInTheDocument()
  })

  it('calls onPrevMonth when left arrow is clicked', () => {
    render(<CalendarGrid {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /mois précédent/i }))
    expect(baseProps.onPrevMonth).toHaveBeenCalledOnce()
  })

  it('calls onNextMonth when right arrow is clicked', () => {
    render(<CalendarGrid {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /mois suivant/i }))
    expect(baseProps.onNextMonth).toHaveBeenCalledOnce()
  })

  it('marks today with calendar-day--today class', () => {
    const { container } = render(<CalendarGrid {...baseProps} />)
    expect(container.querySelector('.calendar-day--today')).toBeInTheDocument()
  })

  it('calls onDayClick with ISO date when a current-month day is clicked', () => {
    const { container } = render(<CalendarGrid {...baseProps} />)
    const today = container.querySelector('.calendar-day--today')
    fireEvent.click(today)
    expect(baseProps.onDayClick).toHaveBeenCalledWith('2026-04-15')
  })

  it('does not call onDayClick when an other-month day is clicked', () => {
    const { container } = render(<CalendarGrid {...baseProps} />)
    const otherDay = container.querySelector('.calendar-day--other-month')
    if (otherDay) fireEvent.click(otherDay)
    expect(baseProps.onDayClick).not.toHaveBeenCalled()
  })

  it('marks selected day with calendar-day--selected class', () => {
    const { container } = render(
      <CalendarGrid {...baseProps} selectedDay="2026-04-15" />
    )
    expect(container.querySelector('.calendar-day--selected')).toBeInTheDocument()
  })

  it('shows 1 dot for a personal event on a day', () => {
    const events = [{ id: 'e1', titre: 'Test', date: '2026-04-15', ajoutePar: 'uid-a', commun: false }]
    const colorMap = { 'uid-a': '#2563eb' }
    const { container } = render(<CalendarGrid {...baseProps} events={events} colorMap={colorMap} />)
    expect(container.querySelectorAll('.calendar-dot')).toHaveLength(1)
  })

  it('shows 2 dots for a common event on a day', () => {
    const events = [{ id: 'e1', titre: 'Dîner', date: '2026-04-15', ajoutePar: 'uid-a', commun: true }]
    const colorMap = { 'uid-a': '#2563eb', 'uid-b': '#16a34a' }
    const { container } = render(<CalendarGrid {...baseProps} events={events} colorMap={colorMap} />)
    expect(container.querySelectorAll('.calendar-dot')).toHaveLength(2)
  })
})
