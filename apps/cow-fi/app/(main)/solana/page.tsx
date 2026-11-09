'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { CowFiCategory } from 'src/common/analytics/types'

import {
  DevelopersSection,
  DisclaimerSection,
  FaqSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  PartnersSection,
  StatsStrip,
  TrustedSection,
  WhySection,
} from './sections'
import { SolanaFonts, SolanaPageWrapper } from './styled'

export default function Page(): ReactNode {
  const analytics = useCowAnalytics()

  useEffect(() => {
    analytics.sendEvent({ category: CowFiCategory.SOLANA, action: 'sol_website_visit' })
  }, [analytics])

  return (
    <SolanaPageWrapper>
      <SolanaFonts />
      <HeroSection />
      <StatsStrip />
      <WhySection />
      <HowItWorksSection />
      <TrustedSection />
      <DevelopersSection />
      <PartnersSection />
      <FinalCtaSection />
      <FaqSection />
      <DisclaimerSection />
    </SolanaPageWrapper>
  )
}
