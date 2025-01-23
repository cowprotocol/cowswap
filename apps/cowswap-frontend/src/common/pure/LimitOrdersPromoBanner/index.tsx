import { useState, useEffect } from 'react'

import iconCompleted from '@cowprotocol/assets/cow-swap/check.svg'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { ArrowBackground } from '../ArrowBackground'

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
  const [isHovered, setIsHovered] = useState(false)
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null)
  const [arrowsReady, setArrowsReady] = useState(false)

  useEffect(() => {
    // First make arrows visible but transparent
    setArrowsReady(true)

    // Wait for animations to be ready before showing
    const timer = setTimeout(() => {
      if (arrowRef) {
        arrowRef.classList.add('show')
      }
    }, 1000)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [arrowRef])

  return (
    <styledEl.BannerWrapper>
      <ArrowBackground
        ref={setArrowRef}
        count={20}
        color={`var(${UI.COLOR_SUCCESS})`}
        className={arrowsReady ? 'visible' : ''}
        maxOpacity={0.3}
      />
      <styledEl.CloseButton size={24} onClick={onDismiss} />
      <styledEl.TitleSection>
        <h3>Level Up Your Trading with Smarter Limit Orders!</h3>
        <strong>Discover the smarter way to trade with these exciting new features:</strong>
      </styledEl.TitleSection>

      <styledEl.List>
        {BULLET_POINTS.map((point, index) => (
          <li key={index}>
            <span>
              <SVG src={iconCompleted} />
            </span>{' '}
            {point}
          </li>
        ))}
      </styledEl.List>

      <styledEl.ControlSection>
        <styledEl.CTAButton
          onClick={onCtaClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <styledEl.ButtonText $hover={isHovered}>Place your limit order!</styledEl.ButtonText>
          <styledEl.Shimmer />
        </styledEl.CTAButton>
        {!isLimitOrdersTab && <styledEl.DismissLink onClick={onDismiss}>Maybe next time</styledEl.DismissLink>}
      </styledEl.ControlSection>
    </styledEl.BannerWrapper>
  )
}
