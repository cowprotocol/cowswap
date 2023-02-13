import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useClaimState } from 'state/claim/hooks'
import { ClaimSummary as ClaimSummaryWrapper, ClaimSummaryTitle, ClaimTotal } from './styled'
import { ClaimCommonTypes } from './types'
import { ClaimStatus } from 'state/claim/actions'
import { useTokenBalance } from 'state/connection/hooks'
import { V_COW } from 'constants/tokens'
import { useWeb3React } from '@web3-react/core'
import JSBI from 'jsbi'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

type ClaimSummaryProps = Pick<ClaimCommonTypes, 'hasClaims' | 'isClaimed'> & {
  unclaimedAmount: ClaimCommonTypes['tokenCurrencyAmount'] | undefined
}

export function ClaimSummary({ hasClaims, isClaimed, unclaimedAmount }: ClaimSummaryProps) {
  const { chainId } = useWeb3React()
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
            <p>
              {' '}
              <TokenAmount amount={totalAvailableAmount} defaultValue="0" tokenSymbol={totalAvailableAmount.currency} />
            </p>
          </ClaimTotal>
        </div>
      )}
    </ClaimSummaryWrapper>
  )
}
