'use client'

import type { ReactNode } from 'react'

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
import { SolanaPageWrapper } from './styled'

export default function Page(): ReactNode {
  return (
    <SolanaPageWrapper>
      <HeroSection />
      <StatsStrip />
      <WhySection />
      <HowItWorksSection />
      <TrustedSection />
      <DevelopersSection />
      <PartnersSection />
      <FaqSection />
      <FinalCtaSection />
      <DisclaimerSection />
    </SolanaPageWrapper>
  )
}
