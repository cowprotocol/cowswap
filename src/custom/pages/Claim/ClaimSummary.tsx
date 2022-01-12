import { Trans } from '@lingui/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatSmart } from 'utils/format'
import { useClaimState } from 'state/claim/hooks'
import { ClaimSummary as ClaimSummaryWrapper, ClaimSummaryTitle, ClaimTotal } from './styled'
import { ClaimCommonTypes } from './types'
import { ClaimStatus } from 'state/claim/actions'

type ClaimSummaryProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  unclaimedAmount: ClaimCommonTypes['tokenCurrencyAmount'] | undefined
}

export default function ClaimSummary({ hasClaims, unclaimedAmount }: ClaimSummaryProps) {
  const { activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const hasClaimSummary = claimStatus === ClaimStatus.DEFAULT && !isInvestFlowActive

  if (!hasClaimSummary) return null

  return (
    <ClaimSummaryWrapper>
      <CowProtocolLogo size={100} />
      {!activeClaimAccount && !hasClaims && (
        <ClaimSummaryTitle>
          <Trans>
            Claim <b>vCOW</b> token
          </Trans>
        </ClaimSummaryTitle>
      )}
      {activeClaimAccount && (
        <div>
          <ClaimTotal>
            <b>Total available to claim</b>
            <p>{formatSmart(unclaimedAmount) || 0} vCOW</p>
          </ClaimTotal>
        </div>
      )}
    </ClaimSummaryWrapper>
  )
}
