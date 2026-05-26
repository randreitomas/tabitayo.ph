import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-border/70">
      <div className="min-w-0">
        <h1 className="font-heading text-3xl md:text-[2.125rem] text-dark tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {children ? <div className="shrink-0 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  )
}
