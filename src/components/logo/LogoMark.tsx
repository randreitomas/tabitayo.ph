interface LogoMarkProps {
  className?: string
  /** @deprecated Icon uses favicon.svg asset colors */
  color?: string
}

const ICON_SRC = '/favicon.svg'

export function LogoMark({ className = '' }: LogoMarkProps) {
  return (
    <img
      src={ICON_SRC}
      alt=""
      className={['block shrink-0 object-contain', className].filter(Boolean).join(' ')}
      aria-hidden
    />
  )
}
