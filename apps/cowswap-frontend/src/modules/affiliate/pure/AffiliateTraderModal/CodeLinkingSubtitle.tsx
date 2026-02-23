import { type ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { Subtitle } from './styles'

import { type TraderInfoResponse } from '../../api/bffAffiliateApi.types'
import { AFFILIATE_REWARDS_CURRENCY } from '../../config/affiliateProgram.const'
import { formatUsdCompact } from '../../lib/affiliateProgramUtils'
import { HowItWorks } from '../HowItWorks'

export interface CodeLinkingSubtitleProps {
  codeInfo?: TraderInfoResponse | null
}

export function CodeLinkingSubtitle(props: CodeLinkingSubtitleProps): ReactNode {
  const { codeInfo } = props

  if (!codeInfo) {
    return (
      <Subtitle>
        <Trans>
          Code binds on your first eligible trade. Earn rewards for eligible volume within the program window. Payouts
          happen on Ethereum mainnet.
        </Trans>{' '}
        <HowItWorks />
      </Subtitle>
    )
  }

  const rewardAmount = formatUsdCompact(codeInfo.traderRewardAmount)
  const triggerVolume = formatUsdCompact(codeInfo.triggerVolume)
  const { timeCapDays } = codeInfo

  return (
    <Subtitle>
      <Trans>
        Code binds on your first eligible trade. Earn {rewardAmount} {AFFILIATE_REWARDS_CURRENCY} per {triggerVolume} of
        eligible volume in {timeCapDays} days. Payouts happen on Ethereum mainnet.
      </Trans>{' '}
      <HowItWorks />
    </Subtitle>
  )
}
