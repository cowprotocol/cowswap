import { useState, useEffect } from 'react'

import iconCompleted from '@cowprotocol/assets/cow-swap/check.svg'
import { UI } from '@cowprotocol/ui'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { ArrowBackground } from 'common/pure/ArrowBackground'

import * as styledEl from './styled'

const BULLET_POINTS: MessageDescriptor[] = [
  msg`Locked limits - lock or unlock prices for finer control, the order does the rest`,
  msg`Easily set and manage your orders in USD`,
  msg`Try before you buy - see the potential fill price before you hit trade`,
  msg`Longer limit orders - place orders for up to a year.`,
  msg`Trade your way - personalize the interface and customize your limit orders`,
  msg`More intuitive UI and improved design`,
]

interface LimitOrdersPromoBannerProps {
  onCtaClick: () => void
  onDismiss: () => void
  isLimitOrdersTab?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LimitOrdersPromoBanner({
  onCtaClick,
  onDismiss,
  isLimitOrdersTab = false,
}: LimitOrdersPromoBannerProps) {
  const { i18n } = useLingui()
  const [isHovered, setIsHovered] = useState(false)
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null)
  const [arrowsReady, setArrowsReady] = useState(false)
  const darkMode = useIsDarkMode()

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
        className={arrowsReady ? 'visible' : ''}
        maxOpacity={0.3}
        color={darkMode ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : `var(${UI.COLOR_COWAMM_DARK_GREEN})`}
      />
      <styledEl.CloseButton size={24} onClick={onDismiss} />
      <styledEl.TitleSection>
        <h3>
          <Trans>
            Limit orders, but <span>s-moooo-ther</span> than ever
          </Trans>
        </h3>
        <strong>
          <Trans>
            Limit orders are now easier to use. <br /> Give them a try
          </Trans>
        </strong>
      </styledEl.TitleSection>

      <styledEl.List>
        {BULLET_POINTS.map((point, index) => (
          <li key={index}>
            <span>
              <SVG src={iconCompleted} />
            </span>
            {i18n._(point)}
          </li>
        ))}
      </styledEl.List>

      <styledEl.ControlSection>
        <styledEl.CTAButton
          onClick={onCtaClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <styledEl.ButtonText $hover={isHovered}>
            <Trans>Try new limit orders now</Trans>
          </styledEl.ButtonText>
          <styledEl.Shimmer />
        </styledEl.CTAButton>
        {!isLimitOrdersTab && (
          <styledEl.DismissLink onClick={onDismiss}>
            <Trans>Maybe next time</Trans>
          </styledEl.DismissLink>
        )}
      </styledEl.ControlSection>
    </styledEl.BannerWrapper>
  )
}
