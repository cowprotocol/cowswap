import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

interface OrderSummaryProps {
  inputToken: TokenInfo
  outputToken: TokenInfo
  sellAmount: string
  buyAmount: string
  kind: OrderKind
  children?: JSX.Element | string
}

export function OrderSummary(props: OrderSummaryProps) {
  const { kind, sellAmount, buyAmount, outputToken, inputToken, children } = props
  const isSell = isSellOrder(kind)

  const inputAmount = useMemo(() => {
    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(inputToken), sellAmount)
  }, [inputToken, sellAmount])

  const outputAmount = useMemo(() => {
    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(outputToken), buyAmount)
  }, [buyAmount, outputToken])

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />

  return (
    <div>
      {isSell ? (
        <>
          Sell {inputAmountElement} for at least {outputAmountElement}
        </>
      ) : (
        <>
          Buy {outputAmountElement} for at most {inputAmountElement}
        </>
      )}
      {children}
    </div>
  )
}
