import { ReactNode, useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

import { useAutoFitText } from '../../../common/hooks/useAutoFitText'
import { truncateWithEllipsis } from '../helpers'
import { OrderProgressBarProps } from '../types'

export function ShowSurplus({
  order,
  shouldShowSurplus,
  surplusPercentValue,
}: {
  order: OrderProgressBarProps['order']
  shouldShowSurplus: boolean | undefined | null
  surplusPercentValue: string
}): ReactNode {
  const surplusText = shouldShowSurplus && surplusPercentValue !== 'N/A' ? `+${surplusPercentValue}%` : t`N/A`
  const surplusRef = useAutoFitText<HTMLSpanElement>({ min: 14, max: 50, mode: 'single', deps: [surplusText] })
  const taglineRef = useAutoFitText<HTMLSpanElement>({ min: 16, max: 22, mode: 'single' })
  const pairRef = useAutoFitText<HTMLSpanElement>({ min: 14, max: 22, mode: 'multi' })

  return (
    <styledEl.BenefitSurplusContainer>
      <styledEl.TaglineText ref={taglineRef}>
        <Trans>I received surplus on</Trans>
      </styledEl.TaglineText>
      <styledEl.TokenPairTitle ref={pairRef} title={`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`}>
        {truncateWithEllipsis(`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`, 30)}
      </styledEl.TokenPairTitle>{' '}
      <styledEl.Surplus>
        <styledEl.SurplusValue ref={surplusRef}>{surplusText}</styledEl.SurplusValue>
      </styledEl.Surplus>
    </styledEl.BenefitSurplusContainer>
  )
}

export function NoSurplus({ randomBenefit }: { randomBenefit: string }): ReactNode {
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const query = '(max-width: 640px)'
    const mediaQueryList = typeof window !== 'undefined' ? window.matchMedia(query) : null
    if (!mediaQueryList) return

    const handler = (event: MediaQueryListEvent): void => setIsSmallScreen(event.matches)
    setIsSmallScreen(mediaQueryList.matches)

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handler)
    } else {
      // Safari fallback
      mediaQueryList.addListener(handler)
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handler)
      } else {
        mediaQueryList.removeListener(handler)
      }
    }
  }, [])

  const benefitRef = useAutoFitText<HTMLDivElement>({
    min: 12,
    max: isSmallScreen ? 28 : 36,
    deps: [randomBenefit, isSmallScreen],
  })

  return (
    <styledEl.BenefitSurplusContainer>
      <styledEl.BenefitTagLine>
        <Trans>Did you know?</Trans>
      </styledEl.BenefitTagLine>
      <styledEl.BenefitText>
        <styledEl.BenefitResponsiveText ref={benefitRef}>{randomBenefit}</styledEl.BenefitResponsiveText>
      </styledEl.BenefitText>
    </styledEl.BenefitSurplusContainer>
  )
}
