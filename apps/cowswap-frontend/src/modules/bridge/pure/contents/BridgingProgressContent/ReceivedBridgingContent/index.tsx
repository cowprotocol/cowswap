import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { SuccessTextBold } from '../../../../styles'
import { TokenAmountDisplay } from '../../../TokenAmountDisplay'

interface ReceivedBridgingContentProps {
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null | undefined
}

export function ReceivedBridgingContent({ receivedAmountUsd, receivedAmount }: ReceivedBridgingContentProps) {
  return (
    <ConfirmDetailsItem
      label={
        <ReceiveAmountTitle variant="success">
          <SuccessTextBold>You received</SuccessTextBold>
        </ReceiveAmountTitle>
      }
    >
      <b>
        <TokenAmountDisplay displaySymbol currencyAmount={receivedAmount} usdValue={receivedAmountUsd} />
      </b>
    </ConfirmDetailsItem>
  )
}
