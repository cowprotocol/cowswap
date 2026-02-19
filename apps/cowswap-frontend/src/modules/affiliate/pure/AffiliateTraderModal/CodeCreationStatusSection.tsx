import { ReactNode } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { TraderReferralCodeStatusMessages } from './StatusMessages'

import { TraderWalletStatus } from '../../hooks/useAffiliateTraderWallet'
import { AffiliateProgramParams } from '../../lib/affiliateProgramTypes'

import type { TraderReferralCodeVerificationStatus } from '../../hooks/useAffiliateTraderVerification'

export interface CodeCreationStatusSectionProps {
  walletStatus: TraderWalletStatus
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationProgramParams?: AffiliateProgramParams
  verificationEligible?: boolean
}

export function CodeCreationStatusSection(props: CodeCreationStatusSectionProps): ReactNode {
  const { walletStatus, verificationStatus, verificationProgramParams, verificationEligible } = props
  const timeCapDays = verificationStatus === 'valid' ? verificationProgramParams?.timeCapDays : undefined
  const eligibilityUnknown = walletStatus === TraderWalletStatus.ELIGIBILITY_UNKNOWN
  const eligibilityCheckIsLoading = walletStatus === TraderWalletStatus.PENDING
  const shouldShowInfo = eligibilityUnknown
    ? true
    : verificationStatus === 'valid' && verificationEligible === true && !eligibilityCheckIsLoading
  const infoMessage = eligibilityUnknown
    ? t`We weren't able to check your eligibility. Feel free to continue, but you won't receive rewards if you traded on CoW Swap before.`
    : timeCapDays
      ? t`Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active for ${timeCapDays} days.`
      : t`Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active for the entire program.`
  const variant = eligibilityUnknown ? StatusColorVariant.Warning : StatusColorVariant.Info

  return (
    <TraderReferralCodeStatusMessages infoMessage={infoMessage} shouldShowInfo={shouldShowInfo} variant={variant} />
  )
}
