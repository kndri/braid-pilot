import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}