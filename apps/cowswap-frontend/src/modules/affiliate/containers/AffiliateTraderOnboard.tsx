import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getDefaultTraderRewardAmount,
  getDefaultTriggerVolume,
} from '../lib/affiliateProgramUtils'
import { HeroActions, HeroCard, HeroContent, HeroSubtitle, HeroTitle } from '../pure/AffiliateCards.shared'
import { AffiliateTermsFaqLinks } from '../pure/AffiliateLayout.shared'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderOnboard(): ReactNode {
  const { account } = useWalletInfo()
  const toggleWalletModal = useToggleWalletModal()
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)
  const traderRewardAmount = formatUsdcCompact(getDefaultTraderRewardAmount())
  const triggerVolumeLabel = formatUsdCompact(getDefaultTriggerVolume())
  const affiliateTimeCapDays = PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

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
            <ButtonPrimary onClick={toggleAffiliateModal}>
              <Trans>Add code</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={toggleWalletModal}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          )}
        </HeroActions>
        <AffiliateTermsFaqLinks />
      </HeroContent>
    </HeroCard>
  )
}
