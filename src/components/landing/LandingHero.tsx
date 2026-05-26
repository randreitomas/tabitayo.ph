import { Link } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'
import { Button } from '@/components/ui/Button'

const HIGHLIGHTS = [
  { label: 'QR seat lookup', tone: 'rose' as const },
  { label: 'Floor plan & menu', tone: 'sage' as const },
  { label: 'No app download', tone: 'gold' as const },
]

const toneClass = {
  rose: 'border-dusty-rose/50 bg-dusty-rose/15 text-dark',
  sage: 'border-sage/50 bg-sage/20 text-dark',
  gold: 'border-gold/50 bg-gold/20 text-dark',
}

export function LandingHero() {
  return (
    <section
      id="home"
      className="scroll-mt-20 relative overflow-hidden px-4 pt-14 pb-20 md:pt-20 md:pb-28"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: [
            'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(232, 196, 184, 0.45) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 40% at 100% 50%, rgba(168, 201, 181, 0.2) 0%, transparent 55%)',
          ].join(', '),
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-[1fr_minmax(280px,360px)] gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <LogoFull size="lg" horizontal className="mb-6 justify-center lg:justify-start" />
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-4">
              Philippine event seat finder
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem] leading-[1.1] text-dark tracking-tight mb-6">
              Every guest finds their seat —{' '}
              <span className="italic text-dusty-rose">without the chaos</span>
            </h1>
            <p className="text-base md:text-lg text-muted max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Weddings, debuts, and corporate galas deserve a calm arrival. Tabitayo helps guests
              scan, search, and sit — while you focus on the celebration.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-8">
              <Link to="/register">
                <Button size="lg">Start as host</Button>
              </Link>
              <Link to="/e/evt-demo">
                <Button size="lg" variant="secondary">
                  Try guest demo
                </Button>
              </Link>
            </div>
            <ul className="flex flex-wrap justify-center lg:justify-start gap-2">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item.label}
                  className={[
                    'text-xs font-body px-3 py-1.5 rounded-full border',
                    toneClass[item.tone],
                  ].join(' ')}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-sm border border-border bg-ivory/90 shadow-sm p-6 space-y-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Guest experience</p>
              <div className="space-y-3 font-heading">
                <div className="rounded-sm border border-dusty-rose/30 bg-dusty-rose/10 px-4 py-3">
                  <p className="text-sm text-muted font-body mb-1">Search</p>
                  <p className="text-lg text-dark">Maria Santos</p>
                </div>
                <div className="rounded-sm border border-sage/40 bg-sage/15 px-4 py-4 text-center">
                  <p className="text-2xl text-dark">Table 12</p>
                  <p className="text-sm text-muted font-body mt-1">Seat 4 · Garden wing</p>
                </div>
              </div>
              <p className="text-xs text-muted font-body leading-relaxed">
                One QR code. Names, tables, floor plan, and menu — all in the browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
