import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import SAD_COW_FACE_ILLUSTRATION from '@cowprotocol/assets/cow-swap/sad-cow-face.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'
import { IneligibleImage } from '../pure/shared'
import { TraderIneligible } from '../pure/TraderIneligible'
import { affiliateTraderModalAtom, closeTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderModalIneligible(): ReactNode {
  const { source: entrySource } = useAtomValue(affiliateTraderModalAtom)
  const closeAffiliateModal = useSetAtom(closeTraderModalAtom)
  const analytics = useCowAnalytics()
  const walletStatus = useAffiliateTraderWallet()

  const onGoBack = useCallback(() => {
    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_modal_primary_cta_clicked',
      ctaType: 'goBack',
      entrySource,
      walletStatus,
    })
    closeAffiliateModal()
  }, [analytics, closeAffiliateModal, entrySource, walletStatus])

  return (
    <>
      <Body>
        <IneligibleImage src={SAD_COW_FACE_ILLUSTRATION} ariaHidden />
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
