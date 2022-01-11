import { Trans } from '@lingui/macro'
import { useClaimState } from 'state/claim/hooks'
import { CheckIcon, EligibleBanner as EligibleBannerWrapper } from './styled'
import { ClaimStatus } from 'state/claim/actions'

export default function EligibleBanner({ hasClaims }: { hasClaims: boolean }) {
  const { claimStatus, activeClaimAccount, isInvestFlowActive } = useClaimState()

  const isEligible = claimStatus === ClaimStatus.DEFAULT && !!activeClaimAccount && !isInvestFlowActive && hasClaims

  if (!isEligible) return null

  return (
    <EligibleBannerWrapper>
      <CheckIcon />
      <Trans>This account is eligible for vCOW token claims!</Trans>
    </EligibleBannerWrapper>
  )
}
