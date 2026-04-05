import { useNavigate, useLocation } from 'react-router-dom'
import './ComingSoonPage.css'

const LABELS = {
  '/courses':   { icon: '🛒', nom: 'Courses' },
  '/repas':     { icon: '🍽️', nom: 'Repas' },
  '/frigo':     { icon: '🧊', nom: 'Frigo' },
  '/menage':    { icon: '🧹', nom: 'Ménage' },
  '/bricolage': { icon: '🔧', nom: 'Bricolage' },
  '/depenses':  { icon: '💰', nom: 'Dépenses' },
  '/notes':     { icon: '📝', nom: 'Notes' },
}

export default function ComingSoonPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const module = LABELS[pathname] ?? { icon: '🏠', nom: 'Module' }

  return (
    <div className="coming-soon">
      <button className="coming-soon__back" onClick={() => navigate('/')}>
        ‹ Retour
      </button>
      <div className="coming-soon__icon">{module.icon}</div>
      <h1 className="coming-soon__title">{module.nom}</h1>
      <p className="coming-soon__subtitle">Bientôt disponible</p>
    </div>
  )
}
