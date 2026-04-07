import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import ModuleCard from '../components/ModuleCard'
import AlertBanner from '../components/AlertBanner'
import '../styles/dashboard.css'

const MODULES = [
  { id: 'courses',   icon: '🛒', nom: 'Courses',   path: '/courses',   color: '#22c55e' },
  { id: 'repas',     icon: '🍽️', nom: 'Repas',     path: '/repas',     color: '#f97316' },
  { id: 'frigo',     icon: '🧊', nom: 'Frigo',     path: '/frigo',     color: '#06b6d4' },
  { id: 'menage',    icon: '🧹', nom: 'Ménage',    path: '/menage',    color: '#a855f7' },
  { id: 'bricolage', icon: '🔧', nom: 'Bricolage', path: '/bricolage', color: '#f59e0b' },
  { id: 'depenses',  icon: '💰', nom: 'Dépenses',  path: '/depenses',  color: '#eab308' },
  { id: 'agenda',    icon: '📅', nom: 'Agenda',    path: '/agenda',    color: '#3b82f6' },
  { id: 'notes',     icon: '📝', nom: 'Notes',     path: '/notes',     color: '#ec4899' },
  { id: 'recap',     icon: '📊', nom: 'Récap',     path: '/recap',     color: '#8b5cf6' },
]

function formatDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const summary = useDashboardSummary(profile?.foyerId)
  const initial = profile?.nom?.[0]?.toUpperCase() ?? '?'

  function getCardProps(id) {
    if (id === 'courses') return { subtitle: summary.courses.subtitle, badge: summary.courses.badge }
    if (id === 'frigo') return { subtitle: summary.frigo.subtitle, badge: summary.frigo.badge, variant: summary.frigo.badge ? 'warn' : undefined }
    if (id === 'repas') return { subtitle: summary.repas.subtitle, badge: summary.repas.badge }
    if (id === 'menage') return { subtitle: summary.menage.subtitle, badge: summary.menage.badge, variant: summary.menage.badge ? 'warn' : undefined }
    if (id === 'bricolage') return { subtitle: summary.bricolage.subtitle, badge: summary.bricolage.badge, variant: summary.bricolage.badge ? 'warn' : undefined }
    if (id === 'depenses') return { subtitle: summary.depenses.subtitle, badge: summary.depenses.badge }
    if (id === 'agenda') return { subtitle: summary.agenda.subtitle, badge: summary.agenda.badge }
    if (id === 'notes') return { subtitle: summary.notes.subtitle, badge: summary.notes.badge }
    return {}
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__date">{formatDate()}</div>
          <div className="dashboard__greeting">Bonjour {profile?.nom} 👋</div>
        </div>
        <Link to="/profil" className="dashboard__avatars">
          <div
            className="dashboard__avatar"
            style={{ background: profile?.couleur ?? '#2563eb' }}
          >
            {initial}
          </div>
        </Link>
      </div>

      <AlertBanner message={summary.frigo.alertMessage} />

      <div className="dashboard__grid">
        {MODULES.map(m => (
          <ModuleCard key={m.id} {...m} {...getCardProps(m.id)} />
        ))}
      </div>
    </div>
  )
}
