import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { TraderReferralCodeSubtitleProps } from './AffiliateTraderModal.types'
import { Subtitle } from './styles'

import { AFFILIATE_REWARDS_CURRENCY } from '../../config/affiliateProgram.const'
import { TraderReferralCodeIncomingReason, TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'
import { HowItWorks } from '../HowItWorks'
import { TraderIneligible } from '../TraderIneligible'

export function AffiliateTraderSubtitle(props: TraderReferralCodeSubtitleProps): ReactNode {
  const { isLinked, hasRejection, rejectionCode, uiState } = props

  if (isLinked && !hasRejection) {
    return <LinkedSubtitle />
  }

  if (hasRejection && rejectionCode) {
    return <RejectedSubtitle rejectionCode={rejectionCode} rejectionReason={props.rejectionReason} />
  }

  if (uiState === 'ineligible') {
    return <IneligibleSubtitle incomingCode={props.incomingIneligibleCode} />
  }

  return <ProgramSubtitle verification={props.verification} isConnected={props.isConnected} />
}

function LinkedSubtitle(): ReactNode {
  return (
    <Subtitle>
      <Trans>Your wallet is already linked to a referral code.</Trans> <HowItWorks />
    </Subtitle>
  )
}

function RejectedSubtitle({
  rejectionCode,
  rejectionReason,
}: {
  rejectionCode: string
  rejectionReason?: TraderReferralCodeIncomingReason
}): ReactNode {
  return (
    <Subtitle>
      <Trans>
        The code <strong>{rejectionCode}</strong> from your link wasn’t applied.
      </Trans>
      {rejectionReason === 'invalid' && (
        <>
          {' '}
          <Trans>It isn't a valid referral code.</Trans>
        </>
      )}
      {rejectionReason === 'ineligible' && (
        <>
          {' '}
          <Trans>This wallet isn't eligible.</Trans>
        </>
      )}{' '}
      <HowItWorks />
    </Subtitle>
  )
}

function IneligibleSubtitle({ incomingCode }: { incomingCode?: string }): ReactNode {
  return (
    <Subtitle>
      <TraderIneligible incomingCode={incomingCode} />
    </Subtitle>
  )
}

function ProgramSubtitle({
  verification,
  isConnected,
}: {
  verification: TraderReferralCodeVerificationStatus
  isConnected: boolean
}): ReactNode {
  const programParams = verification.kind === 'valid' ? verification.programParams : undefined
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
