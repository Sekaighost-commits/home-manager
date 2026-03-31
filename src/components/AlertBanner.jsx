export default function AlertBanner({ message }) {
  if (!message) return null
  return (
    <div className="alert-banner" role="alert">
      <span className="alert-banner__icon">⚠️</span>
      <span>{message}</span>
    </div>
  )
}
