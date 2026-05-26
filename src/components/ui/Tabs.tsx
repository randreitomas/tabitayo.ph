import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]

  return (
    <div>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border -mx-1 px-1 scrollbar-none"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => onChange(tab.id)}
            className={[
              'shrink-0 px-3 py-2.5 text-xs sm:text-sm font-body whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab.id === activeId
                ? 'border-dusty-rose text-dark font-medium'
                : 'border-transparent text-muted hover:text-dark',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-5" role="tabpanel">
        {active?.content}
      </div>
    </div>
  )
}
