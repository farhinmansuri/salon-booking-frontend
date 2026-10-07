export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} aria-invalid={Boolean(error)} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
