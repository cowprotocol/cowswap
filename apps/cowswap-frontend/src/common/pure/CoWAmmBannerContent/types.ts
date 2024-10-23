import { ReactNode } from 'react'

export interface CoWAmmBannerContext {
  title: string
  ctaText: string
  aprMessage: string
  comparisonMessage: ReactNode
  isMobile: boolean
  onClose(): void
  onCtaClick(): void
  handleCTAMouseEnter(): void
  handleCTAMouseLeave(): void
}
