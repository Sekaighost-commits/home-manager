import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import ModuleCard from '../components/ModuleCard'
import AlertBanner from '../components/AlertBanner'
import '../styles/dashboard.css'

const MODULES = [
  { id: 'courses',   icon: '🛒', nom: 'Courses',   path: '/courses' },
  { id: 'repas',     icon: '🍽️', nom: 'Repas',     path: '/repas' },
  { id: 'frigo',     icon: '🧊', nom: 'Frigo',     path: '/frigo' },
  { id: 'menage',    icon: '🧹', nom: 'Ménage',    path: '/menage' },
  { id: 'bricolage', icon: '🔧', nom: 'Bricolage', path: '/bricolage' },
  { id: 'depenses',  icon: '💰', nom: 'Dépenses',  path: '/depenses' },
  { id: 'agenda',    icon: '📅', nom: 'Agenda',    path: '/agenda' },
  { id: 'notes',     icon: '📝', nom: 'Notes',     path: '/notes' },
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
