import { isAddress, isCowOrder, shortenAddress } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { OnToastMessagePayload, ToastMessageType } from '@cowprotocol/events'
import { TokenAmount, formatTokenAmountWithSymbol } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

const OrderLinkWrapper = styled.div`
  margin-top: 15px;
  text-decoration: underline;

  &:hover,
  &:hover a {
    text-decoration: none !important;
  }
`

const ORDER_TYPE_TITLES: Record<UiOrderType, string> = {
  [UiOrderType.SWAP]: 'Swap',
  [UiOrderType.LIMIT]: 'Limit order',
  [UiOrderType.TWAP]: 'TWAP order',
}

export interface PendingOrderNotificationProps {
  account: string
  chainId: SupportedChainId
  orderId: string
  kind: OrderKind
  orderType: UiOrderType
  inputAmount: CurrencyAmount<Token>
  outputAmount: CurrencyAmount<Token>
  receiver?: string
  orderCreationHash?: string
  isSafeWallet: boolean
}

export function getPendingOrderNotificationToast(props: PendingOrderNotificationProps): OnToastMessagePayload | null {
  const { orderId, kind, inputAmount, outputAmount, receiver, account } = props

  if (!account) return null

  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  const inputAmountElement = formatTokenAmountWithSymbol({
    amount: inputAmount,
    tokenSymbol: inputAmount.currency,
  })
  const outputAmountElement = formatTokenAmountWithSymbol({
    amount: outputAmount,
    tokenSymbol: outputAmount.currency,
  })

  const baseMessage = (() => {
    const isSellOrder = kind === OrderKind.SELL

    if (isSellOrder) {
      return `Sell ${inputAmountElement} for at least ${outputAmountElement}`
    } else {
      return `Buy ${inputAmountElement} for at most ${outputAmountElement}`
    }
  })()

  return {
    messageType: ToastMessageType.SWAP_POSTED_API,
    message: toAddress && receiver ? `${baseMessage}. Receiver: ${toAddress}` : baseMessage,
    data: {
      orderUid: orderId,
    },
  }
}

export function PendingOrderNotification(props: PendingOrderNotificationProps) {
  const { chainId, account, isSafeWallet, orderId, kind, orderType, inputAmount, outputAmount, receiver } = props

  if (!account) return null

  const isSellOrder = kind === OrderKind.SELL
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount.currency} />

  const tx = {
    hash: orderId,
    hashType: isSafeWallet && !isCowOrder('transaction', orderId) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: orderId,
      safe: account,
    },
  }

  return (
    <>
      <strong>{ORDER_TYPE_TITLES[orderType]} submitted</strong>
      <br />
      {isSellOrder ? (
        <>
          Sell {inputAmountElement} for at least {outputAmountElement}
        </>
      ) : (
        <>
          Buy {outputAmountElement} for at most {inputAmountElement}
        </>
      )}
      {toAddress && receiver && (
        <div>
          Receiver: <ExplorerLink id={receiver} label={toAddress} type="address" />
        </div>
      )}
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
