export const dynamic = 'force-dynamic'

import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Benefits } from '@/components/landing/Benefits'
import { Routes } from '@/components/landing/Routes'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PricingBanner } from '@/components/landing/PricingBanner'
import { FAQSection } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Routes />
        <HowItWorks />
        <PricingBanner />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
