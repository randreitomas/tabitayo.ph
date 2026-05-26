import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function BusinessTeaser() {
  return (
    <section id="business" className="scroll-mt-20 py-16 md:py-20 px-4 bg-border/25">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">For event professionals</p>
        <h2 className="font-heading text-3xl md:text-4xl leading-tight mb-6">
          Stop re-printing seating charts at the last minute
        </h2>
        <div className="space-y-4 text-sm md:text-base text-dark/90 leading-relaxed text-left md:text-center">
          <p>
            Most planners spend countless hours organizing, printing, and re-printing seating
            charts — often right before doors open. Tabitayo helps you lock in your plan digitally,
            update your guest list anytime, and share one QR code that never changes.
          </p>
          <p>
            Whether you run weddings, debuts, galas, or corporate events, you get branded guest
            pages, floor plans, menus, and seat lookup — without the stress of a &ldquo;final&rdquo;
            printout that never stays final.
          </p>
          <p>
            Save hours, cut print costs, and give guests a polished arrival experience from the
            moment they scan.
          </p>
        </div>
        <div className="mt-8">
          <Link to="/business">
            <Button size="lg" variant="secondary">
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
