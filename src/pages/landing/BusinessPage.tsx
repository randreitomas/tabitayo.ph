import { LandingHeader } from '@/components/landing/LandingHeader'
import { BusinessSection } from '@/components/landing/BusinessSection'
import { MarketingFooter } from '@/components/landing/MarketingFooter'
import { AuthBackLink } from '@/components/auth/AuthBackLink'

export function BusinessPage() {
  return (
    <div className="min-h-dvh bg-ivory flex flex-col">
      <LandingHeader />
      <div className="max-w-6xl mx-auto w-full px-4 pt-4">
        <AuthBackLink />
      </div>
      <main className="flex-1">
        <BusinessSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
