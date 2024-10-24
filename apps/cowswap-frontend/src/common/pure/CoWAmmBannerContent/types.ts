export interface CoWAmmBannerContext {
  title: string
  ctaText: string
  isMobile: boolean
  onClose(): void
  onCtaClick(): void
  handleCTAMouseEnter(): void
  handleCTAMouseLeave(): void
}
