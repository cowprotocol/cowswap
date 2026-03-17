import { useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import { Routes } from 'common/constants/routes'

import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'
import { HowItWorks } from '../pure/HowItWorks'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderModalCodeInfo(): ReactNode {
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)
  const analytics = useCowAnalytics()

  useEffect(() => {
    analytics.sendEvent({
      category: 'affiliate',
      action: 'view_linked',
      label: 'modal',
    })
  }, [analytics])

  const onViewRewards = (): void => {
    analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'view_rewards' })
    toggleAffiliateModal()
  }

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
