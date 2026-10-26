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

import { PageWrapper } from '@/styles/styled'

export default function Page(): ReactNode {
  return (
    <PageWrapper>
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
    </PageWrapper>
  )
}
