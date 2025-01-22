import { Command } from '@cowprotocol/types'

import * as styledEl from './styled'

interface LimitOrdersPromoBannerProps {
  onCtaClick: Command
  onDismiss: Command
  isLimitOrdersTab?: boolean
}

const BULLET_POINTS = [
  'Set your limit price and lock it so the token amounts change accordingly for more intuitive trades.',
  'Enter Buy/Sell amounts, and the limit price adjusts automatically.',
  'Easily set and manage your limit orders in dollar terms for precision.',
  'See realistic fill price expectations before placing your order.',
  'Limit orders now stay active for up to 1 year—trade with confidence!',
  'Arrange fields to reflect your trading style and preferences.',
]

export function LimitOrdersPromoBanner({
  onCtaClick,
  onDismiss,
  isLimitOrdersTab = false,
}: LimitOrdersPromoBannerProps) {
  return (
    <styledEl.BannerWrapper>
      <styledEl.CloseButton size={24} onClick={onDismiss} />
      <styledEl.Content>
        <styledEl.Title>Level Up Your Trading with Smarter Limit Orders!</styledEl.Title>
        <styledEl.Subtitle>Discover the smarter way to trade with these exciting new features:</styledEl.Subtitle>
        <styledEl.BulletPoints>
          {BULLET_POINTS.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </styledEl.BulletPoints>
        <styledEl.CTAButton onClick={onCtaClick}>PLACE YOUR LIMIT ORDER NOW!</styledEl.CTAButton>
        {!isLimitOrdersTab && <styledEl.DismissLink onClick={onDismiss}>Maybe next time</styledEl.DismissLink>}
      </styledEl.Content>
    </styledEl.BannerWrapper>
  )
}
