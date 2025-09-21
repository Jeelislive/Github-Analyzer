import Hero from '@/components/sections/hero'
import Features from '@/components/sections/features'
import HowItWorks from '@/components/sections/how-it-works'
import Testimonials from '@/components/sections/testimonials'
import Pricing from '@/components/sections/pricing'
import DocumentationPreview from '@/components/sections/documentation-preview'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        {/* <DocumentationPreview /> */}
      </div>
    </div>
  )
}
