import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'

import CheckCircle from 'legacy/assets/cow-swap/check.svg'
import useNetworkName from 'legacy/hooks/useNetworkName'
import { ClaimStatus } from 'legacy/state/claim/actions'
import { useClaimState } from 'legacy/state/claim/hooks'

import { ClaimCommonTypes } from 'pages/Claim/types'

import { ClaimBanner as ClaimBannerWrapper } from './styled'

type ClaimBannerProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isClaimed: boolean
}

export default function ClaimBanner({ hasClaims, isClaimed }: ClaimBannerProps) {
  const networkName = useNetworkName()
  const { claimStatus, activeClaimAccount, isInvestFlowActive } = useClaimState()

  const shouldShowBanner =
    claimStatus === ClaimStatus.DEFAULT && !!activeClaimAccount && !isInvestFlowActive && (hasClaims || isClaimed)

  if (!shouldShowBanner) return null

  return (
    <ClaimBannerWrapper isClaimed={isClaimed}>
      <SVG src={CheckCircle} description="eligible" />
      <Trans>
        {hasClaims
          ? 'This account is eligible for vCOW token claims!'
          : `This account has already claimed vCOW tokens${networkName && ' on ' + networkName}!`}
      </Trans>
    </ClaimBannerWrapper>
  )
}
