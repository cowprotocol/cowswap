import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { useClaimState } from 'state/claim/hooks'
import { ClaimSummary as ClaimSummaryWrapper, ClaimSummaryTitle, ClaimTotal } from './styled'
import { ClaimCommonTypes } from './types'
import { ClaimStatus } from 'state/claim/actions'
import { AMOUNT_PRECISION } from 'constants/index'
import { useTokenBalance } from 'state/wallet/hooks'
import { V_COW } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks'

type ClaimSummaryProps = Pick<ClaimCommonTypes, 'hasClaims' | 'isClaimed'> & {
  unclaimedAmount: ClaimCommonTypes['tokenCurrencyAmount'] | undefined
}

export function ClaimSummary({ hasClaims, isClaimed, unclaimedAmount }: ClaimSummaryProps) {
  const { chainId } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const vCowBalance = useTokenBalance(activeClaimAccount || undefined, chainId ? V_COW[chainId] : undefined)

  const hasClaimSummary = claimStatus === ClaimStatus.DEFAULT && !isInvestFlowActive

  if (!hasClaimSummary) return null

  const totalAvailableAmount = hasClaims && activeClaimAccount && unclaimedAmount ? unclaimedAmount : vCowBalance

  return (
    <ClaimSummaryView
      showClaimText={!activeClaimAccount && !hasClaims}
      totalAvailableAmount={totalAvailableAmount}
      totalAvailableText={isClaimed ? 'Total claimed' : 'Total available to claim'}
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
            <p title={`${formatMax(totalAvailableAmount, totalAvailableAmount.currency.decimals)} vCOW`}>
              {' '}
              {formatSmartLocaleAware(totalAvailableAmount, AMOUNT_PRECISION) || '0'} vCOW
            </p>
          </ClaimTotal>
        </div>
      )}
    </ClaimSummaryWrapper>
  )
}
