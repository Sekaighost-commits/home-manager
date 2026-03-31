import { useAuth } from '../contexts/AuthContext'
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
  const initial = profile?.nom?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__date">{formatDate()}</div>
          <div className="dashboard__greeting">Bonjour {profile?.nom} 👋</div>
        </div>
        <div className="dashboard__avatars">
          <div
            className="dashboard__avatar"
            style={{ background: profile?.couleur ?? '#2563eb' }}
          >
            {initial}
          </div>
        </div>
      </div>

      {/* AlertBanner — alimenté dynamiquement dans Plan 2 */}
      <AlertBanner message={null} />

      <div className="dashboard__grid">
        {MODULES.map(m => (
          <ModuleCard key={m.id} {...m} />
        ))}
      </div>
    </div>
  )
}
