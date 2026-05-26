import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-dark/90 text-ivory hover:bg-dark/80 border border-dark/90 disabled:opacity-50',
  accent:
    'bg-sage/45 text-dark border border-sage/60 hover:bg-sage/60 disabled:opacity-50',
  secondary:
    'bg-ivory text-dark border border-border hover:bg-border/50 disabled:opacity-50',
  ghost: 'bg-transparent text-dark hover:bg-border/35 disabled:opacity-50',
  danger:
    'bg-red-700/90 text-ivory hover:bg-red-800 border border-red-700 disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 min-h-10 px-3 text-xs leading-none',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center box-border font-body rounded-sm transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
