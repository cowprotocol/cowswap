import { ReactNode } from 'react'

import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { ConfirmDetailsItem } from 'modules/trade'

import { ArrowIcon, TokenFlowContainer } from '../../styles'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

interface RouteTitleProps {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  buyAmountUsd?: CurrencyAmount<Token> | null
  chainName: string
}

export function RouteTitle({ chainName, sellAmount, buyAmount, buyAmountUsd }: RouteTitleProps): ReactNode {
  return (
    <ConfirmDetailsItem label="" withTimelineDot>
      <TokenFlowContainer>
        <TokenAmountDisplay currencyAmount={sellAmount} displaySymbol />
        <ArrowIcon>→</ArrowIcon>
        <TokenAmountDisplay currencyAmount={buyAmount} usdValue={buyAmountUsd} displaySymbol /> <Trans>on</Trans>{' '}
        {chainName}
      </TokenFlowContainer>
    </ConfirmDetailsItem>
  )
}
