import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

function Block({
  title,
  children,
  accent,
}: {
  title: string
  children: ReactNode
  accent?: 'rose' | 'sage' | 'gold'
}) {
  const border =
    accent === 'sage'
      ? 'border-sage/40'
      : accent === 'gold'
        ? 'border-gold/50'
        : 'border-dusty-rose/40'

  return (
    <article className={`border-l-2 ${border} pl-5 md:pl-6 py-1`}>
      <h3 className="font-heading text-2xl md:text-3xl mb-4">{title}</h3>
      <div className="space-y-4 text-sm md:text-base text-dark/90 leading-relaxed">{children}</div>
    </article>
  )
}

export function BusinessSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto space-y-14 md:space-y-16">
        <header className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Business</p>
          <h2 className="font-heading text-3xl md:text-5xl leading-tight mb-4">
            Built for planners who are done with last-minute seating chaos
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Tabitayo helps event professionals deliver a polished guest experience — without
            printing, re-printing, or scrambling at the door.
          </p>
        </header>

        <Block title="Save time and money">
          <p>
            Most planners spend countless hours organizing, printing, and re-printing seating
            charts — often at the last minute. With Tabitayo, you can save both time and money.
          </p>
          <p>
            Sadly, planners often face endless stress when finalizing seating plans. It is not
            their fault. Until now, there has been no easy way to manage it. Our platform was
            created to eliminate the chaos of table planning, helping you lock in seating plans
            quickly and without reprints.
          </p>
          <p>
            Organize signage ahead of time, and make unlimited updates to your guest list — your
            event QR code never changes.
          </p>
        </Block>

        <Block title="A quick and easy way to organize your guest experience" accent="sage">
          <p>
            Tired of managing last-minute RSVP changes and complex seating logistics? Tabitayo
            helps event professionals streamline one of the most time-consuming parts of event
            delivery in minutes, so you can focus on running a seamless experience rather than
            managing manual processes.
          </p>
          <p>
            Deliver polished, digital seating with integrated floor plans and digital menus —
            eliminating the cost and inefficiency of traditional print-and-pray methods.
          </p>
        </Block>

        <Block title="Your event. Your brand. Your experience." accent="gold">
          <p>
            When your clients are paying for a premium experience, every touchpoint matters —
            including how guests find their seat.
          </p>
          <p>
            With Tabitayo, you can make the entire seating experience feel built for your event.
            Set custom branding colors, upload your logo, and match the look of your brand or your
            client&apos;s brand. No generic screens. No cluttered distractions. Just a polished,
            professional, cohesive experience from the moment guests arrive.
          </p>
        </Block>

        <Block title="Built with business in mind">
          <p>
            We work closely with companies and event agencies planning weddings, galas, award
            dinners, debuts, and corporate events across the Philippines — taking real feedback to
            make the platform smarter and easier every time.
          </p>
          <p>
            Why waste weeks stressing over table assignments? Don&apos;t stay up until 1&nbsp;a.m.
            rearranging seats, or scramble when a client makes a last-minute change thirty minutes
            before the event and you just printed the &ldquo;final&rdquo; sheet. There is no such
            thing as final.
          </p>
          <p>
            With Tabitayo, you save hours, avoid headaches, and get a better result every time.
            It&apos;s a shortcut for peace of mind — more time for the parts of planning you love,
            and more budget for what really matters.
          </p>
        </Block>

        <div className="text-center pt-4 border-t border-border">
          <p className="font-heading text-xl md:text-2xl mb-6">
            Ready to lock in your seating plan in record time?
          </p>
          <p className="text-sm text-muted mb-8 max-w-md mx-auto">
            Start today — your first 100 guests are completely free on the Free tier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Host sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
