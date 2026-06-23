import { type ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { Subtitle } from './styles'

import { type TraderInfoResponse } from '../../api/bffAffiliateApi.types'
import { PROGRAM_DEFAULTS } from '../../config/affiliateProgram.const'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getDefaultTraderRewardAmount,
  getDefaultTriggerVolume,
} from '../../lib/affiliateProgramUtils'
import { HowItWorks } from '../HowItWorks'

export interface CodeLinkingSubtitleProps {
  codeInfo?: TraderInfoResponse | null
  isWalletConnected?: boolean
}

export function CodeLinkingSubtitle(props: CodeLinkingSubtitleProps): ReactNode {
  const { codeInfo, isWalletConnected } = props
  const rewardAmount = formatUsdcCompact(codeInfo?.traderRewardAmount ?? getDefaultTraderRewardAmount())
  const triggerVolume = formatUsdCompact(codeInfo?.triggerVolume ?? getDefaultTriggerVolume())
  const timeCapDays = codeInfo?.timeCapDays ?? PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  return (
    <Subtitle>
      <Trans>Your friend shared a referral code with you.</Trans>{' '}
      {isWalletConnected ? (
        <Trans>Start earning rewards when you trade.</Trans>
      ) : (
        <Trans>Connect your wallet to activate it and start earning rewards when you trade.</Trans>
      )}{' '}
      <Trans>
        Earn <strong>{rewardAmount}</strong> per <strong>{triggerVolume}</strong> of eligible volume over {timeCapDays}{' '}
        days. Rewards are paid out weekly to your Ethereum wallet.
      </Trans>{' '}
      <HowItWorks />
    </Subtitle>
  )
}
