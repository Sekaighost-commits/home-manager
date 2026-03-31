import { Link } from 'react-router-dom'

export default function ModuleCard({ id, icon, nom, path, subtitle, badge, variant }) {
  return (
    <Link to={path} className={`module-card ${variant ? `module-card--${variant}` : ''}`}>
      {badge != null && badge > 0 && (
        <span className="module-card__badge" role="status">{badge}</span>
      )}
      <span className="module-card__icon">{icon}</span>
      <span className="module-card__name">{nom}</span>
      {subtitle && (
        <span className={`module-card__subtitle ${variant ? `module-card__subtitle--${variant}` : ''}`}>
          {subtitle}
        </span>
      )}
    </Link>
  )
}
