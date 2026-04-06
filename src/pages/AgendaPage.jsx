import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAgenda } from '../hooks/useAgenda'
import { useFoyerMembers } from '../hooks/useFoyerMembers'
import AddSheet from '../components/AddSheet'
import CalendarGrid from '../components/CalendarGrid'
import '../styles/module.css'

function getInitiale(nom) {
  if (!nom) return '?'
  return nom.charAt(0).toUpperCase()
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const foyerId = profile?.foyerId ?? null

  const { evenements, loading: loadingEvt, addEvenement, deleteEvenement } = useAgenda(foyerId)
  const { membres, loading: loadingMembres } = useFoyerMembers(foyerId)

  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selectedDay, setSelectedDay] = useState(null)
  const [showSheet, setShowSheet] = useState(false)
  const [titre, setTitre] = useState('')
  const [commun, setCommun] = useState(false)

  if (loadingEvt || loadingMembres) {
    return <div className="module-page" style={{ '--module-accent': '#3b82f6' }} />
  }

  const colorMap = Object.fromEntries(membres.map(m => [m.uid, m.couleur]))

  function prevMonth() {
    setCurrentMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
  }

  function nextMonth() {
    setCurrentMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
  }

  function handleDayClick(dateStr) {
    setSelectedDay(dateStr)
    setShowSheet(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = titre.trim()
    if (!trimmed || !selectedDay) return
    await addEvenement({ titre: trimmed, date: selectedDay, ajoutePar: user.uid, commun })
    setTitre('')
    setCommun(false)
    setShowSheet(false)
  }

  const dayEvents = selectedDay
    ? evenements.filter(e => e.date === selectedDay)
    : []

  const dayLabel = selectedDay
    ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        .format(new Date(selectedDay + 'T00:00:00'))
    : ''

  return (
    <div className="module-page" style={{ '--module-accent': '#3b82f6' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)}>‹ Retour</button>
        <span className="page-header__title">Agenda</span>
        <span className="page-header__action" />
      </header>

      <CalendarGrid
        currentMonth={currentMonth}
        events={evenements}
        colorMap={colorMap}
        selectedDay={selectedDay}
        onDayClick={handleDayClick}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />

      <AddSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        title={dayLabel}
      >
        <div className="item-list" style={{ padding: 0, maxHeight: '40vh', overflowY: 'auto' }}>
          {dayEvents.length === 0 && (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <span className="empty-state__text">Aucun évènement ce jour</span>
            </div>
          )}
          {dayEvents.map(evt => {
            const creatorColor = colorMap[evt.ajoutePar] ?? '#888888'
            const creator = membres.find(m => m.uid === evt.ajoutePar)
            const other = membres.find(m => m.uid !== evt.ajoutePar)
            return (
              <div key={evt.id} className="event-row">
                <div className="event-row__bar" style={{ background: creatorColor }} />
                <div className="event-row__body">{evt.titre}</div>
                <div className="event-row__avatars">
                  <div
                    className="event-row__avatar"
                    style={{ background: creatorColor }}
                  >
                    {getInitiale(creator?.nom)}
                  </div>
                  {evt.commun && other && (
                    <div
                      className="event-row__avatar"
                      style={{ background: colorMap[other.uid] ?? '#888888' }}
                    >
                      {getInitiale(other.nom)}
                    </div>
                  )}
                </div>
                <button
                  className="list-item__delete"
                  aria-label="supprimer"
                  onClick={() => deleteEvenement(evt.id)}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>

        <form role="form" className="sheet-form" onSubmit={handleSubmit} aria-label="Ajouter un évènement">
          <input
            className="add-form__input"
            placeholder="Titre…"
            value={titre}
            onChange={e => setTitre(e.target.value)}
          />
          <label className="commun-checkbox">
            <input
              type="checkbox"
              checked={commun}
              onChange={e => setCommun(e.target.checked)}
              aria-label="Nous deux"
            />
            Nous deux
          </label>
          <button type="submit" className="sheet-form__submit">Ajouter</button>
        </form>
      </AddSheet>
    </div>
  )
}
