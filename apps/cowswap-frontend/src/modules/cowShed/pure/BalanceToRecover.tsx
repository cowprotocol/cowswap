import { ReactNode } from 'react'

import { Loader, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

interface BalanceToRecoverProps {
  tokenBalance: CurrencyAmount<Currency> | null
  isBalanceLoading: boolean
}

export function BalanceToRecover({ tokenBalance, isBalanceLoading }: BalanceToRecoverProps): ReactNode {
  return (
    <p>
      Balance to be recovered:
      <br />
      {tokenBalance ? (
        <b>
          <TokenAmount amount={tokenBalance} defaultValue="0" tokenSymbol={tokenBalance.currency} />
        </b>
      ) : isBalanceLoading ? (
        <Loader />
      ) : null}
    </p>
  )
}
