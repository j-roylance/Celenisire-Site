interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, id, ...props }: FormInputProps) {
  const inputId = id || props.name;
  return (
    <div className="form-group">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input id={inputId} className="form-input" {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
