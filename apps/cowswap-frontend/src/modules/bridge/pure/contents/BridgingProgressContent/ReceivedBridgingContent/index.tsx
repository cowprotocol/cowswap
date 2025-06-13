import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { BridgeStatusResult, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { SuccessTextBold } from '../../../../styles'
import { TokenAmountDisplay } from '../../../TokenAmountDisplay'

interface ReceivedBridgingContentProps {
  statusResult?: BridgeStatusResult
  sourceChainId: SupportedChainId
  destinationChainId: number
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ReceivedBridgingContent({
  statusResult,
  receivedAmountUsd,
  receivedAmount,
  sourceChainId,
  destinationChainId,
}: ReceivedBridgingContentProps) {
  const { depositTxHash, fillTxHash } = statusResult || {}

  const depositLink = depositTxHash && getExplorerLink(sourceChainId, depositTxHash, ExplorerDataType.TRANSACTION)
  const fillTxLink =
    fillTxHash &&
    destinationChainId in SupportedChainId &&
    getExplorerLink(destinationChainId, fillTxHash, ExplorerDataType.TRANSACTION)

  return (
    <>
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
      {depositLink && <ExternalLink href={depositLink}>Deposit transaction ↗</ExternalLink>}
      {fillTxLink && <ExternalLink href={fillTxLink}>Settlement transaction ↗</ExternalLink>}
    </>
  )
}
