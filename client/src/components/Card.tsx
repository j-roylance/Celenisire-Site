interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return <div className={`card ${glow ? 'card-glow' : ''} ${className}`.trim()}>{children}</div>;
}
