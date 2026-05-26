import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingSection, SectionIntro } from '@/components/landing/LandingSection'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PricingTable } from '@/components/landing/PricingTable'
import { BusinessTeaser } from '@/components/landing/BusinessTeaser'
import { MarketingFooter } from '@/components/landing/MarketingFooter'

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

const TESTIMONIALS = [
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
]

const GUEST_STEPS = [
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
]

const HOST_STEPS = [
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
]

function StepList({
  items,
  accent,
}: {
  items: typeof GUEST_STEPS
  accent: 'rose' | 'sage'
}) {
  const ring =
    accent === 'rose'
      ? 'border-dusty-rose/50 bg-dusty-rose/20 text-dark'
      : 'border-sage/50 bg-sage/25 text-dark'

  return (
    <ol className="space-y-6">
      {items.map((item) => (
        <li key={item.step} className="flex gap-4">
          <span
            className={[
              'shrink-0 w-10 h-10 rounded-full border flex items-center justify-center font-heading text-lg',
              ring,
            ].join(' ')}
          >
            {item.step}
          </span>
          <div className="pt-0.5">
            <h4 className="font-heading text-lg md:text-xl text-dark mb-1">{item.title}</h4>
            <p className="text-sm text-muted leading-relaxed">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

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
    <div className="min-h-dvh bg-ivory text-dark">
      <LandingHeader />
      <LandingHero />
      <BusinessTeaser />

      <LandingSection id="feedback">
        <SectionIntro
          eyebrow="Feedback"
          title="Loved by hosts across Luzon, Visayas & Mindanao"
          description="Early partners told us ushers spent less time answering “Table ko saan?” and more time welcoming guests."
        />
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <Card
              key={t.name}
              padding="md"
              className="flex flex-col border-border/80 hover:border-dusty-rose/40 transition-colors"
            >
              <p className="text-sm md:text-base italic leading-relaxed flex-1 text-dark/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-border/60">
                <p className="font-heading text-xl text-dark">{t.name}</p>
                <p className="text-xs text-muted mt-1">{t.event}</p>
              </div>
            </Card>
          ))}
        </div>
      </LandingSection>

      <LandingSection id="how-it-works" alt wide>
        <SectionIntro
          eyebrow="How it works"
          title="Simple for guests, easy for hosts"
          description="Two sides of the same celebration — one link for everyone."
        />
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <div className="rounded-sm border border-border bg-ivory p-6 md:p-8">
            <h3 className="font-heading text-2xl md:text-3xl text-center mb-8 text-dusty-rose">
              For guests
            </h3>
            <StepList items={GUEST_STEPS} accent="rose" />
          </div>
          <div className="rounded-sm border border-border bg-ivory p-6 md:p-8">
            <h3 className="font-heading text-2xl md:text-3xl text-center mb-8 text-sage">
              For hosts
            </h3>
            <StepList items={HOST_STEPS} accent="sage" />
          </div>
        </div>
        <div className="text-center mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/e/evt-demo">
            <Button variant="secondary" size="lg">
              Try guest demo
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg">Create free event</Button>
          </Link>
        </div>
      </LandingSection>

      <LandingSection id="faqs" alt narrow>
        <SectionIntro eyebrow="FAQs" title="Questions we hear often" />
        <dl className="space-y-0 max-w-2xl mx-auto">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-b border-border py-6 first:pt-0 last:border-0">
              <dt className="font-heading text-lg md:text-xl text-dark mb-2">{faq.q}</dt>
              <dd className="text-sm md:text-base text-muted leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </LandingSection>

      <LandingSection id="pricing" wide>
        <SectionIntro
          eyebrow="Pricing"
          title="Simple tiers for every celebration"
          description="Per event. No subscriptions. Upgrade anytime before your big day."
        />
        <PricingTable />
        <div className="text-center mt-12">
          <Link to="/register">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </LandingSection>

      <MarketingFooter />
    </div>
  )
}
