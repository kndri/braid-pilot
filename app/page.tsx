import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TrustIndicators from '@/components/TrustIndicators'
import MonitoringFeatures from '@/components/MonitoringFeatures'
import Testimonials from '@/components/Testimonials'
import PricingSection from '@/components/PricingSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustIndicators />
        <MonitoringFeatures />
        <Testimonials />
        <PricingSection />
      </main>
      <Footer />
    </>
  )
}
