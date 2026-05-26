import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LandingSection, SectionIntro } from '@/components/landing/LandingSection'

export function BusinessTeaser() {
  return (
    <LandingSection id="business" alt className="!py-14 md:!py-20">
      <div className="max-w-3xl mx-auto">
        <SectionIntro
          eyebrow="For event professionals"
          title="Stop re-printing seating charts at the last minute"
          className="mb-10"
        />
        <div className="space-y-5 text-sm md:text-base text-dark/90 leading-relaxed text-center">
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
          <p className="text-muted">
            Save hours, cut print costs, and give guests a polished arrival experience from the
            moment they scan.
          </p>
        </div>
        <div className="mt-10 text-center">
          <Link to="/business">
            <Button size="lg" variant="secondary">
              Learn more for planners
            </Button>
          </Link>
        </div>
      </div>
    </LandingSection>
  )
}
