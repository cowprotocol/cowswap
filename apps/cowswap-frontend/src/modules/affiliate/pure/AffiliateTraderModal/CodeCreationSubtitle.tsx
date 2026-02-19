import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { Subtitle } from './styles'

import { AFFILIATE_REWARDS_CURRENCY } from '../../config/affiliateProgram.const'
import { HowItWorks } from '../HowItWorks'

export interface CodeCreationSubtitleProps {
  hasProgramDetails: boolean
  isConnected: boolean
  rewardAmount?: string
  triggerVolume?: string
  timeCapDays?: number
}

export function CodeCreationSubtitle(props: CodeCreationSubtitleProps): ReactNode {
  const { hasProgramDetails, isConnected, rewardAmount, triggerVolume, timeCapDays } = props

  return (
    <Subtitle>
      {hasProgramDetails ? (
        isConnected ? (
          <Trans>
            Code binds on your first eligible trade. Earn {rewardAmount} {AFFILIATE_REWARDS_CURRENCY} per $
            {triggerVolume} of eligible volume in {timeCapDays} days. Payouts happen on Ethereum mainnet.
          </Trans>
        ) : (
          <Trans>
            Connect to verify eligibility. Code binds on your first eligible trade. Earn {rewardAmount}{' '}
            {AFFILIATE_REWARDS_CURRENCY} per ${triggerVolume} of eligible volume in {timeCapDays} days. Payouts happen
            on Ethereum mainnet.
          </Trans>
        )
      ) : isConnected ? (
        <Trans>
          Code binds on your first eligible trade. Earn rewards for eligible volume within the program window. Payouts
          happen on Ethereum mainnet.
        </Trans>
      ) : (
        <Trans>
          Connect to verify eligibility. Code binds on your first eligible trade. Earn rewards for eligible volume
          within the program window. Payouts happen on Ethereum mainnet.
        </Trans>
      )}{' '}
      <HowItWorks />
    </Subtitle>
  )
}
