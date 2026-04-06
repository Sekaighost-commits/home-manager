// src/pages/RecapPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRecap } from '../hooks/useRecap'
import '../styles/module.css'

const MONTH_NAMES = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc']

function getPills() {
  const now = new Date()
  const pills = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    pills.push({ annee: d.getFullYear(), mois: d.getMonth() })
  }
  return pills
}

export default function RecapPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const foyerId = profile?.foyerId ?? null

  const pills = getPills()
  const [selected, setSelected] = useState(pills[pills.length - 1]) // mois courant

  const { courses, depenses, agenda, totalDepenses, depensesParCategorie, loading } =
    useRecap(foyerId, selected.annee, selected.mois)

  const agendaSorted = [...agenda].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="module-page" style={{ '--module-accent': '#8b5cf6' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')}>‹ Retour</button>
        <span className="page-header__title">Récap</span>
        <span className="page-header__action" />
      </header>

      <div className="recap-pills">
        {pills.map(p => {
          const isSelected = p.annee === selected.annee && p.mois === selected.mois
          return (
            <button
              key={`${p.annee}-${p.mois}`}
              className={`recap-pill${isSelected ? ' recap-pill--selected' : ''}`}
              onClick={() => setSelected(p)}
            >
              {MONTH_NAMES[p.mois]}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="module-page" />
      ) : (
        <>
          {/* Courses */}
          <section className="recap-section">
            <h3 className="recap-section__title">
              🛒 Courses — {courses.length} article{courses.length !== 1 ? 's' : ''}
            </h3>
            {courses.length === 0 ? (
              <span className="empty-state__text">Rien à afficher ce mois</span>
            ) : (
              <div className="recap-chips">
                {courses.map(c => (
                  <span key={c.id} className="recap-chip">{c.nom}</span>
                ))}
              </div>
            )}
          </section>

          {/* Dépenses */}
          <section className="recap-section">
            <h3 className="recap-section__title">
              💸 Dépenses — {totalDepenses.toFixed(2)} €
            </h3>
            {depensesParCategorie.length === 0 ? (
              <span className="empty-state__text">Rien à afficher ce mois</span>
            ) : (
              <div className="recap-depenses">
                {depensesParCategorie.map(({ categorie, total }) => (
                  <div key={categorie} className="recap-depense-row">
                    <span>{categorie}</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Agenda */}
          <section className="recap-section">
            <h3 className="recap-section__title">
              📅 Agenda — {agenda.length} évènement{agenda.length !== 1 ? 's' : ''}
            </h3>
            {agendaSorted.length === 0 ? (
              <span className="empty-state__text">Rien à afficher ce mois</span>
            ) : (
              <div className="recap-agenda">
                {agendaSorted.map(evt => (
                  <div key={evt.id} className="recap-agenda-row">
                    <span className="recap-agenda-date">
                      {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
                        .format(new Date(evt.date + 'T00:00:00'))}
                    </span>
                    <span>{evt.titre}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
