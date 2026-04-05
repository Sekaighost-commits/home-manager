const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAY_NAMES = ['L','M','M','J','V','S','D']

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const dow = firstDay.getDay() // 0=Dim
  const offset = dow === 0 ? 6 : dow - 1 // décalage pour lundi en premier
  const days = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(year, month, 1 - offset + i))
  }
  return days
}

function getDotsForDay(dateStr, events, colorMap) {
  const dayEvents = events.filter(e => e.date === dateStr)
  const dots = []
  for (const evt of dayEvents) {
    if (dots.length >= 3) break
    dots.push(colorMap[evt.ajoutePar] ?? '#888888')
    if (evt.commun && dots.length < 3) {
      const otherColor = Object.entries(colorMap).find(([uid]) => uid !== evt.ajoutePar)?.[1] ?? '#888888'
      dots.push(otherColor)
    }
  }
  return dots
}

export default function CalendarGrid({
  currentMonth,
  events,
  colorMap,
  selectedDay,
  onDayClick,
  onPrevMonth,
  onNextMonth,
}) {
  const { year, month } = currentMonth
  const today = toDateStr(new Date())
  const days = getCalendarDays(year, month)

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button
          className="calendar-nav"
          aria-label="mois précédent"
          onClick={onPrevMonth}
        >
          ‹
        </button>
        <span className="calendar-month-label">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          className="calendar-nav"
          aria-label="mois suivant"
          onClick={onNextMonth}
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {DAY_NAMES.map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="calendar-grid">
        {days.map((day, i) => {
          const dateStr = toDateStr(day)
          const isCurrentMonth = day.getMonth() === month
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDay
          const dots = isCurrentMonth ? getDotsForDay(dateStr, events, colorMap) : []

          let className = 'calendar-day'
          if (!isCurrentMonth) className += ' calendar-day--other-month'
          if (isToday) className += ' calendar-day--today'
          if (isSelected) className += ' calendar-day--selected'

          return (
            <div
              key={i}
              className={className}
              onClick={isCurrentMonth ? () => onDayClick(dateStr) : undefined}
            >
              {day.getDate()}
              {dots.length > 0 && (
                <div className="calendar-dots">
                  {dots.map((color, j) => (
                    <div key={j} className="calendar-dot" style={{ background: color }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
