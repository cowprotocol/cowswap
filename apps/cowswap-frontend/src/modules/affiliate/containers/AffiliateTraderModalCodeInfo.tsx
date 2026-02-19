import { ReactNode, useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'
import { HowItWorks } from '../pure/HowItWorks'

export function AffiliateTraderModalCodeInfo(): ReactNode {
  const toggleAffiliateModal = useToggleAffiliateModal()
  const analytics = useCowAnalytics()
  const navigate = useNavigate()

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
    navigate(Routes.ACCOUNT_AFFILIATE_TRADER)
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
        <ButtonPrimary autoFocus disabled={false} onClick={onViewRewards} type="button">
          <Trans>View rewards</Trans>
        </ButtonPrimary>
      </Footer>
    </>
  )
}
