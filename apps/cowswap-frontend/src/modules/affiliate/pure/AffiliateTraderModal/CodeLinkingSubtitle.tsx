import { type ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { Subtitle } from './AffiliateTraderModal.shared'

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
}

export function CodeLinkingSubtitle(props: CodeLinkingSubtitleProps): ReactNode {
  const { codeInfo } = props
  const rewardAmount = formatUsdcCompact(codeInfo?.traderRewardAmount ?? getDefaultTraderRewardAmount())
  const triggerVolume = formatUsdCompact(codeInfo?.triggerVolume ?? getDefaultTriggerVolume())
  const timeCapDays = codeInfo?.timeCapDays ?? PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  return (
    <Subtitle>
      <Trans>
        Swap once to activate. Earn <strong>{rewardAmount}</strong> per <strong>{triggerVolume}</strong> of eligible
        volume over {timeCapDays} days. Rewards are paid out weekly to your Ethereum wallet.
      </Trans>{' '}
      <HowItWorks />
    </Subtitle>
  )
}
