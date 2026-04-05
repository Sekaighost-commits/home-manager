export default function AddSheet({ open, onClose, title, children }) {
  return (
    <>
      {open && <div className="sheet-backdrop" onClick={onClose} />}
      <div className={`sheet-content${open ? ' sheet-content--open' : ''}`}>
        <div className="sheet-handle" />
        {title && <div className="sheet-title">{title}</div>}
        {children}
      </div>
    </>
  )
}
