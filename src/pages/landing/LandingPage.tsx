import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LogoFull } from '@/components/logo/LogoFull'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PricingTable } from '@/components/landing/PricingTable'
import { BusinessTeaser } from '@/components/landing/BusinessTeaser'
import { MarketingFooter } from '@/components/landing/MarketingFooter'

function Section({
  id,
  children,
  className = '',
  alt = false,
}: {
  id: string
  children: ReactNode
  className?: string
  alt?: boolean
}) {
  return (
    <section
      id={id}
      className={[
        'scroll-mt-20 py-16 md:py-24 px-4',
        alt ? 'bg-border/25' : '',
        className,
      ].join(' ')}
    >
      <div className="max-w-4xl mx-auto">{children}</div>
    </section>
  )
}

const FAQS = [
  {
    q: 'Do guests need to download an app?',
    a: 'No. They scan your event QR code and search their name in the browser — nothing to install.',
  },
  {
    q: 'What if two guests have similar names?',
    a: 'Fuzzy search shows close matches, and guests can browse by table if they are unsure.',
  },
  {
    q: 'Can I update the guest list on the day?',
    a: 'Yes. Add guests manually or upload a CSV from your host dashboard anytime.',
  },
  {
    q: 'Is guest data stored permanently?',
    a: 'We use names only to locate seats for your event. See our PDPA notice on each guest page.',
  },
]

export function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (!hash) return
    const timer = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  return (
    <div className="min-h-dvh bg-ivory">
      <LandingHeader />

      {/* Hero / Home */}
      <section
        id="home"
        className="scroll-mt-20 relative overflow-hidden px-4 pt-12 pb-20 md:pt-20 md:pb-28"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232, 196, 184, 0.35) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          <LogoFull size="lg" className="mb-8" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted mb-4">
            Philippine event seat finder
          </p>
          <h1 className="font-heading text-4xl md:text-6xl leading-tight mb-6">
            Every guest finds their seat —{' '}
            <span className="italic text-dusty-rose">without the chaos</span>
          </h1>
          <p className="text-base md:text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Weddings, debuts, and corporate galas deserve a calm arrival. Tabitayo helps guests
            scan, search, and sit — while you focus on the celebration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg">Start as host</Button>
            </Link>
            <Link to="/e/evt-demo">
              <Button size="lg" variant="secondary">
                Try guest demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BusinessTeaser />

      {/* Feedback */}
      <Section id="feedback">
        <p className="text-xs uppercase tracking-widest text-muted text-center mb-3">Feedback</p>
        <h2 className="font-heading text-3xl md:text-4xl text-center mb-4">
          Loved by hosts across Luzon, Visayas & Mindanao
        </h2>
        <p className="text-center text-muted max-w-2xl mx-auto mb-10">
          Early partners told us the same thing: ushers spent less time answering “Table ko
          saan?” and more time welcoming guests.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              quote:
                'Our 300-guest wedding ran smoother than any spreadsheet we tried before.',
              name: 'Maria & James',
              event: 'Tagaytay garden wedding',
            },
            {
              quote:
                'Debut parents were thrilled — guests found seats in seconds on their phones.',
              name: 'Ana Cruz family',
              event: 'Manila debut',
            },
            {
              quote:
                'Corporate check-in felt premium. QR on each table tent was a nice touch.',
              name: 'Acme Events',
              event: 'Year-end gala, BGC',
            },
          ].map((t) => (
            <Card key={t.name} padding="md" className="flex flex-col">
              <p className="text-sm italic leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-heading text-lg mt-4">{t.name}</p>
              <p className="text-xs text-muted">{t.event}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how-it-works" alt>
        <p className="text-xs uppercase tracking-widest text-muted text-center mb-3">
          How it works
        </p>
        <h2 className="font-heading text-3xl md:text-4xl text-center mb-10">
          Simple for guests, easy for hosts
        </h2>
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 max-w-4xl mx-auto">
          <div>
            <h3 className="font-heading text-2xl text-center mb-6 text-dusty-rose">For guests</h3>
            <ol className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Scan the QR',
                  body: 'Open the event page from a QR at the entrance or on table cards.',
                },
                {
                  step: '2',
                  title: 'Search their name',
                  body: 'Fuzzy matching handles nicknames, “Ma.”, hyphenated surnames, and aliases.',
                },
                {
                  step: '3',
                  title: 'See table & seat',
                  body: 'Table, seat, floor plan, menu, and playlist — all on one page.',
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full border border-dusty-rose/60 bg-dusty-rose/20 flex items-center justify-center font-heading text-base">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-heading text-lg mb-0.5">{item.title}</h4>
                    <p className="text-sm text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-center mb-6 text-sage">For hosts</h3>
            <ol className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Create your event',
                  body: 'Set the name, date, venue, and tier. Toggle photo share for premium events.',
                },
                {
                  step: '2',
                  title: 'Import your guest list',
                  body: 'Add guests manually or upload a CSV with names, tables, and seats.',
                },
                {
                  step: '3',
                  title: 'Share the QR & relax',
                  body: 'Download your QR, add floor plan and menu, approve photos — done.',
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full border border-sage/60 bg-sage/25 flex items-center justify-center font-heading text-base">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-heading text-lg mb-0.5">{item.title}</h4>
                    <p className="text-sm text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/e/evt-demo">
            <Button variant="secondary">Try guest demo</Button>
          </Link>
          <Link to="/register">
            <Button>Create free event</Button>
          </Link>
        </div>
      </Section>

      {/* FAQs */}
      <Section id="faqs" alt>
        <p className="text-xs uppercase tracking-widest text-muted text-center mb-3">FAQs</p>
        <h2 className="font-heading text-3xl md:text-4xl text-center mb-10">
          Questions we hear often
        </h2>
        <dl className="space-y-6 max-w-2xl mx-auto">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-b border-border pb-6 last:border-0">
              <dt className="font-heading text-lg mb-2">{faq.q}</dt>
              <dd className="text-sm text-muted">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted text-center mb-3">Pricing</p>
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-4">
            Simple tiers for every celebration
          </h2>
          <p className="text-center text-muted text-sm mb-10 max-w-lg mx-auto">
            Per event. No subscriptions. Upgrade anytime before your big day.
          </p>
          <PricingTable />
          <div className="text-center mt-10">
            <Link to="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  )
}
