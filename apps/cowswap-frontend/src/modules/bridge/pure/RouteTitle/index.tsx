import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem } from 'modules/trade'

import { ArrowIcon, TokenFlowContainer } from '../../styles'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

interface RouteTitleProps {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  buyAmountUsd?: CurrencyAmount<Token> | null
  chainName: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RouteTitle({ chainName, sellAmount, buyAmount, buyAmountUsd }: RouteTitleProps) {
  return (
    <ConfirmDetailsItem label="" withTimelineDot>
      <TokenFlowContainer>
        <TokenAmountDisplay currencyAmount={sellAmount} displaySymbol />
        <ArrowIcon>→</ArrowIcon>
        <TokenAmountDisplay currencyAmount={buyAmount} usdValue={buyAmountUsd} displaySymbol />
        {` on ${chainName}`}
      </TokenFlowContainer>
    </ConfirmDetailsItem>
  )
}
