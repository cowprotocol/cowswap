import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatSmart } from 'utils/format'
import { useClaimState } from 'state/claim/hooks'
import { ClaimSummary as ClaimSummaryWrapper, ClaimSummaryTitle, ClaimTotal } from './styled'
import { ClaimCommonTypes } from './types'
import { ClaimStatus } from 'state/claim/actions'
import { AMOUNT_PRECISION } from 'constants/index'

type ClaimSummaryProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  unclaimedAmount: ClaimCommonTypes['tokenCurrencyAmount'] | undefined
}

export function ClaimSummary({ hasClaims, unclaimedAmount }: ClaimSummaryProps) {
  const { activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const hasClaimSummary = claimStatus === ClaimStatus.DEFAULT && !isInvestFlowActive

  if (!hasClaimSummary) return null

  return (
    <ClaimSummaryView
      showClaimText={!activeClaimAccount && !hasClaims}
      totalAvailableAmount={(activeClaimAccount && unclaimedAmount) || undefined}
      totalAvailableText={'Total available to claim'}
    />
  )
}

type ClaimSummaryViewProps = {
  showClaimText?: boolean
  totalAvailableAmount?: CurrencyAmount<Currency>
  totalAvailableText?: string
}

export function ClaimSummaryView({ showClaimText, totalAvailableText, totalAvailableAmount }: ClaimSummaryViewProps) {
  return (
    <ClaimSummaryWrapper>
      <CowProtocolLogo size={100} />
      {showClaimText && (
        <ClaimSummaryTitle>
          <Trans>
            Claim <b>vCOW</b> token
          </Trans>
        </ClaimSummaryTitle>
      )}
      {totalAvailableAmount && (
        <div>
          <ClaimTotal>
            {totalAvailableText && <b>{totalAvailableText}</b>}
            <p>
              {formatSmart(totalAvailableAmount, AMOUNT_PRECISION, { thousandSeparator: true, isLocaleAware: true })}{' '}
              vCOW
            </p>
          </ClaimTotal>
        </div>
      )}
    </ClaimSummaryWrapper>
  )
}
