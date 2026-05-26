import { LogoMark } from './LogoMark'

interface LogoFullProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
  horizontal?: boolean
  variant?: 'default' | 'header'
}

const sizes = {
  sm: { text: 'text-xl leading-none', mark: 'h-7 w-7' },
  md: { text: 'text-3xl leading-none', mark: 'h-10 w-10' },
  lg: { text: 'text-4xl md:text-5xl leading-none', mark: 'h-12 w-12 md:h-14 md:w-14' },
}

const headerSizes = {
  text: 'text-xl leading-none font-heading font-semibold tracking-wide relative top-[2px]',
  mark: 'h-7 w-7',
}

export function LogoFull({
  className = '',
  size = 'md',
  light = false,
  horizontal = false,
  variant = 'default',
}: LogoFullProps) {
  const s = variant === 'header' ? headerSizes : sizes[size]

  if (variant === 'header') {
    return (
      <div
        className={[
          'inline-flex h-8 items-center gap-2',
          horizontal ? 'flex-row' : 'flex-col',
          className,
        ].join(' ')}
      >
        <LogoMark className={s.mark} />
        <span className={[s.text, light ? 'text-ivory' : 'text-dark'].join(' ')}>
          tabitayo
        </span>
      </div>
    )
  }

  return (
    <div
      className={[
        'inline-flex items-center justify-center gap-1.5',
        horizontal ? 'flex-row' : 'flex-col gap-0.5',
        className,
      ].join(' ')}
    >
      <LogoMark className={s.mark} />
      <span
        className={[
          'font-heading font-semibold tracking-wide',
          s.text,
          light ? 'text-ivory' : 'text-dark',
        ].join(' ')}
      >
        tabitayo
      </span>
    </div>
  )
}
