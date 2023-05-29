import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import JSBI from 'jsbi'

import CowProtocolLogo from 'legacy/components/CowProtocolLogo'
import { V_COW } from 'legacy/constants/tokens'
import { ClaimStatus } from 'legacy/state/claim/actions'
import { useClaimState } from 'legacy/state/claim/hooks'

import { useTokenBalance } from 'modules/tokens/hooks/useCurrencyBalance'
import { useWalletInfo } from 'modules/wallet'

import { TokenAmount } from 'common/pure/TokenAmount'

import { ClaimSummary as ClaimSummaryWrapper, ClaimSummaryTitle, ClaimTotal } from './styled'
import { ClaimCommonTypes } from './types'

type ClaimSummaryProps = Pick<ClaimCommonTypes, 'hasClaims' | 'isClaimed'> & {
  unclaimedAmount: ClaimCommonTypes['tokenCurrencyAmount'] | undefined
}

export function ClaimSummary({ hasClaims, isClaimed, unclaimedAmount }: ClaimSummaryProps) {
  const { chainId } = useWalletInfo()
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
