import { useSetAtom } from 'jotai'
import { ReactNode, useCallback, useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'
import { TraderIneligible } from '../pure/TraderIneligible'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderModalIneligible(): ReactNode {
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)
  const analytics = useCowAnalytics()

  useEffect(() => {
    analytics.sendEvent({
      category: 'affiliate',
      action: 'view_ineligible',
      label: 'modal',
    })
  }, [analytics])

  const onGoBack = useCallback(() => {
    analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'go_back' })
    toggleAffiliateModal()
  }, [analytics, toggleAffiliateModal])

  return (
    <>
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Your wallet is ineligible</Trans>
        </Title>
        <Subtitle>
          <TraderIneligible />
        </Subtitle>
      </Body>
      <Footer>
        <ButtonPrimary autoFocus disabled={false} onClick={onGoBack} type="button">
          <Trans>Go back</Trans>
        </ButtonPrimary>
      </Footer>
    </>
  )
}
