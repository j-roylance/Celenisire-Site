interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FormTextarea({ label, error, id, ...props }: FormTextareaProps) {
  const inputId = id || props.name;
  return (
    <div className="form-group">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <textarea id={inputId} className="form-textarea" {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
