type BadgeVariant = 'active' | 'ended' | 'archived' | 'pending' | 'approved' | 'suspended' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  active: 'bg-sage/30 text-dark border-sage/50',
  ended: 'bg-border text-muted border-border',
  archived: 'bg-dark/10 text-muted border-dark/20',
  pending: 'bg-gold/30 text-dark border-gold/50',
  approved: 'bg-sage/30 text-dark border-sage/50',
  suspended: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-border/50 text-dark border-border',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 text-xs font-body rounded-full border capitalize',
        styles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
