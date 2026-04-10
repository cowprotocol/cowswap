import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import { Routes } from 'common/constants/routes'

import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'
import { HowItWorks } from '../pure/HowItWorks'
import { affiliateTraderModalAtom, closeTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderModalCodeInfo(): ReactNode {
  const { source: entrySource } = useAtomValue(affiliateTraderModalAtom)
  const closeAffiliateModal = useSetAtom(closeTraderModalAtom)
  const analytics = useCowAnalytics()
  const walletStatus = useAffiliateTraderWallet()

  const onViewRewards = useCallback((): void => {
    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_modal_primary_cta_clicked',
      ctaType: 'viewRewards',
      entrySource,
      walletStatus,
    })
    closeAffiliateModal()
  }, [analytics, closeAffiliateModal, entrySource, walletStatus])

  return (
    <>
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Already linked to a referral code</Trans>
        </Title>
        <Subtitle>
          <Trans>Your wallet is already linked to a referral code.</Trans> <HowItWorks />
        </Subtitle>
      </Body>
      <Footer>
        <ButtonPrimary
          as={Link}
          autoFocus
          disabled={false}
          onClick={onViewRewards}
          to={Routes.ACCOUNT_AFFILIATE_TRADER}
          target="_blank"
        >
          <Trans>View rewards</Trans>
        </ButtonPrimary>
      </Footer>
    </>
  )
}
