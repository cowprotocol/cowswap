import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { TraderReferralCodeSubtitleProps } from './AffiliateTraderModal.types'
import { Subtitle } from './styles'

import { AFFILIATE_REWARDS_CURRENCY } from '../../config/affiliateProgram.const'
import { AffiliateProgramParams, TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'
import { HowItWorks } from '../HowItWorks'
import { TraderIneligible } from '../TraderIneligible'

export function AffiliateTraderSubtitle(props: TraderReferralCodeSubtitleProps): ReactNode {
  const { isLinked, uiState } = props

  if (isLinked) {
    return (
      <Subtitle>
        <Trans>Your wallet is already linked to a referral code.</Trans> <HowItWorks />
      </Subtitle>
    )
  }

  if (uiState === 'ineligible') {
    return (
      <Subtitle>
        <TraderIneligible refCode={props.refCode} />
      </Subtitle>
    )
  }

  return (
    <ProgramSubtitle
      verificationStatus={props.verificationStatus}
      verificationProgramParams={props.verificationProgramParams}
      isConnected={props.isConnected}
    />
  )
}

function ProgramSubtitle({
  verificationStatus,
  verificationProgramParams,
  isConnected,
}: {
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationProgramParams?: AffiliateProgramParams
  isConnected: boolean
}): ReactNode {
  const programParams = verificationStatus === 'valid' ? verificationProgramParams : undefined
  const rewardAmount = programParams ? formatInteger(programParams.traderRewardAmount) : undefined
  const triggerVolume = programParams ? formatInteger(programParams.triggerVolumeUsd) : undefined
  const timeCapDays = programParams?.timeCapDays
  const hasProgramDetails = Boolean(programParams && rewardAmount && triggerVolume && timeCapDays)

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

function formatInteger(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
