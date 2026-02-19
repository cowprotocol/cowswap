import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'
import { TraderIneligible } from '../pure/TraderIneligible'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderModalIneligible(): ReactNode {
  const { code, savedCode } = useAtomValue(affiliateTraderAtom)
  const toggleAffiliateModal = useToggleAffiliateModal()
  const refCode = savedCode || code
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
          <TraderIneligible refCode={refCode} />
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
