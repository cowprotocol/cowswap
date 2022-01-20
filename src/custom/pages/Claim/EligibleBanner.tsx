import { Trans } from '@lingui/macro'
import { useClaimState } from 'state/claim/hooks'
import { EligibleBanner as EligibleBannerWrapper } from './styled'
import CheckCircle from 'assets/cow-swap/check.svg'
import { ClaimStatus } from 'state/claim/actions'

export default function EligibleBanner({ hasClaims }: { hasClaims: boolean }) {
  const { claimStatus, activeClaimAccount, isInvestFlowActive } = useClaimState()

  const isEligible = claimStatus === ClaimStatus.DEFAULT && !!activeClaimAccount && !isInvestFlowActive && hasClaims

  if (!isEligible) return null

  return (
    <EligibleBannerWrapper>
      <img src={CheckCircle} alt="eligible" />
      <Trans>This account is eligible for vCOW token claims!</Trans>
    </EligibleBannerWrapper>
  )
}
