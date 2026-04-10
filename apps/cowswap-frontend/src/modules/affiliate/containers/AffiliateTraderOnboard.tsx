import { useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { AffiliateEntrySource } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getDefaultTraderRewardAmount,
  getDefaultTriggerVolume,
} from '../lib/affiliateProgramUtils'
import { AffiliateTermsFaqLinks, HeroActions, HeroCard, HeroContent, HeroSubtitle, HeroTitle } from '../pure/shared'
import { openTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderOnboard(): ReactNode {
  const { account } = useWalletInfo()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()
  const openAffiliateModal = useSetAtom(openTraderModalAtom)
  const traderRewardAmount = formatUsdcCompact(getDefaultTraderRewardAmount())
  const triggerVolumeLabel = formatUsdCompact(getDefaultTriggerVolume())
  const affiliateTimeCapDays = PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  const onConnectWallet = useCallback((): void => {
    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_onboard_cta_clicked',
      ctaType: 'connectWallet',
    })
    toggleWalletModal()
  }, [analytics, toggleWalletModal])

  const onAddCode = useCallback((): void => {
    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_onboard_cta_clicked',
      ctaType: 'addCode',
    })
    openAffiliateModal(AffiliateEntrySource.TRADER_PAGE_ONBOARD)
  }, [analytics, openAffiliateModal])

  return (
    <HeroCard>
      <HeroContent>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <HeroTitle>
          <Trans>Earn while you trade</Trans>
        </HeroTitle>
        <HeroSubtitle>
          <Trans>
            Use a referral code to earn <strong>{traderRewardAmount}</strong> for
            <br />
            every <strong>{triggerVolumeLabel}</strong> in eligible volume within {affiliateTimeCapDays} days.
            <br />
            New wallets only.
          </Trans>
        </HeroSubtitle>
        <HeroActions>
          {account ? (
            <ButtonPrimary onClick={onAddCode}>
              <Trans>Add code</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={onConnectWallet}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          )}
        </HeroActions>
        <AffiliateTermsFaqLinks />
      </HeroContent>
    </HeroCard>
  )
}
