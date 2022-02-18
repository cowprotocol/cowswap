import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'
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
import { JSBI } from '@uniswap/sdk'

type ClaimSummaryProps = Pick<ClaimCommonTypes, 'hasClaims' | 'isClaimed'> & {
  unclaimedAmount: ClaimCommonTypes['tokenCurrencyAmount'] | undefined
}

export function ClaimSummary({ hasClaims, isClaimed, unclaimedAmount }: ClaimSummaryProps) {
  const { chainId } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const vCow = chainId ? V_COW[chainId] : undefined

  const vCowBalance = useTokenBalance(activeClaimAccount || undefined, vCow)

  const hasClaimSummary = claimStatus === ClaimStatus.DEFAULT && !isInvestFlowActive

  if (!hasClaimSummary || !vCow) return null

  let totalAvailableAmount: CurrencyAmount<Token> | undefined = CurrencyAmount.fromRawAmount(vCow, JSBI.BigInt(0))

  if (hasClaims && activeClaimAccount && unclaimedAmount) {
    totalAvailableAmount = unclaimedAmount
  } else if (isClaimed) {
    totalAvailableAmount = vCowBalance
  }

  return (
    <ClaimSummaryView
      activeClaimAccount={activeClaimAccount}
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
  activeClaimAccount: string
}

export function ClaimSummaryView({
  showClaimText,
  totalAvailableText,
  totalAvailableAmount,
  activeClaimAccount,
}: ClaimSummaryViewProps) {
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
      {totalAvailableAmount && activeClaimAccount && (
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
