import { Outlet } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'

export function GuestLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-ivory">
      <header className="py-6 px-4 text-center border-b border-border/60">
        <LogoFull size="md" />
      </header>
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <footer className="px-4 py-4 text-center border-t border-border/60">
        <p className="text-[10px] text-muted leading-relaxed max-w-sm mx-auto">
          PDPA Notice: Your name is used only to locate your seat at this event. We do not
          store personal data beyond what the host provides. Photos you upload may be visible
          to other guests after host approval.
        </p>
      </footer>
    </div>
  )
}
