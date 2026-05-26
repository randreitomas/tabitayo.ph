type BadgeVariant = 'active' | 'ended' | 'archived' | 'pending' | 'approved' | 'suspended' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  active: 'bg-sage/25 text-dark border-sage/45',
  ended: 'bg-border/80 text-muted border-border',
  archived: 'bg-border/60 text-muted border-border',
  pending: 'bg-gold/25 text-dark/90 border-gold/45',
  approved: 'bg-sage/25 text-dark border-sage/45',
  suspended: 'bg-red-50 text-red-800 border-red-200/80',
  default: 'bg-border/40 text-dark/85 border-border',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 text-xs font-body rounded-full border capitalize',
        styles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
