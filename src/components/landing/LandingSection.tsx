import type { ReactNode } from 'react'

interface LandingSectionProps {
  id: string
  children: ReactNode
  className?: string
  alt?: boolean
  narrow?: boolean
  wide?: boolean
}

const widthClass = {
  default: 'max-w-5xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-6xl',
}

export function LandingSection({
  id,
  children,
  className = '',
  alt = false,
  narrow = false,
  wide = false,
}: LandingSectionProps) {
  const maxW = wide ? widthClass.wide : narrow ? widthClass.narrow : widthClass.default

  return (
    <section
      id={id}
      className={[
        'scroll-mt-20 py-16 md:py-24 px-4',
        alt ? 'bg-[#f3ede6]/60' : '',
        className,
      ].join(' ')}
    >
      <div className={[maxW, 'mx-auto'].join(' ')}>{children}</div>
    </section>
  )
}

interface SectionIntroProps {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionIntro({ eyebrow, title, description, className = '' }: SectionIntroProps) {
  return (
    <header className={['text-center max-w-2xl mx-auto mb-12 md:mb-14', className].join(' ')}>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-body mb-3">
        {eyebrow}
      </p>
      <h2 className="font-heading text-3xl md:text-[2.375rem] text-dark leading-tight tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm md:text-base text-muted mt-4 leading-relaxed">{description}</p>
      )}
    </header>
  )
}
