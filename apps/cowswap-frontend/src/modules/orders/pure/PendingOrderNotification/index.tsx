import { isAddress, isCowOrder, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { OnToastMessagePayload, ToastMessageType } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'
import { formatTokenAmountWithSymbol, TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { ORDER_UI_TYPE_TITLES } from 'utils/orderUtils/getUiOrderType'

const OrderLinkWrapper = styled.div`
  margin-top: 15px;
  text-decoration: underline;

  &:hover,
  &:hover a {
    text-decoration: none !important;
  }
`

export interface PendingOrderNotificationProps {
  owner: string
  chainId: SupportedChainId
  orderUid: string
  kind: OrderKind
  orderType: UiOrderType
  inputAmount: CurrencyAmount<Token>
  outputAmount: CurrencyAmount<Token>
  receiver?: string
  isSafeWallet: boolean
}

export function getPendingOrderNotificationToast(props: PendingOrderNotificationProps): OnToastMessagePayload {
  const { owner, orderUid, kind, inputAmount, outputAmount, receiver, orderType } = props

  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  const inputAmountElement = formatTokenAmountWithSymbol({
    amount: inputAmount,
    tokenSymbol: inputAmount.currency,
  })
  const outputAmountElement = formatTokenAmountWithSymbol({
    amount: outputAmount,
    tokenSymbol: outputAmount.currency,
  })

  const messagePrefix = `${ORDER_UI_TYPE_TITLES[orderType]} submitted: `

  const baseMessage = (() => {
    const isSellOrder = kind === OrderKind.SELL

    if (isSellOrder) {
      return `Sell ${inputAmountElement} for at least ${outputAmountElement}`
    } else {
      return `Buy ${outputAmountElement} for at most ${inputAmountElement}`
    }
  })()

  const receiverInfo = toAddress && receiver !== owner ? `Receiver: ${toAddress}` : ''
  const message = receiverInfo ? `${baseMessage}. ${receiverInfo}` : baseMessage

  return {
    messageType: ToastMessageType.SWAP_POSTED_API,
    message: messagePrefix + message,
    data: {
      orderUid,
    },
  }
}

export function PendingOrderNotification(props: PendingOrderNotificationProps) {
  const { owner, chainId, isSafeWallet, orderUid, kind, orderType, inputAmount, outputAmount, receiver } = props

  const isSell = isSellOrder(kind)
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount.currency} />

  const tx = {
    hash: orderUid,
    hashType: isSafeWallet && !isCowOrder('transaction', orderUid) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: orderUid,
      safe: owner,
    },
  }

  return (
    <>
      <strong>{ORDER_UI_TYPE_TITLES[orderType]} submitted</strong>
      <br />
      {isSell ? (
        <>
          Sell {inputAmountElement} for at least {outputAmountElement}
        </>
      ) : (
        <>
          Buy {outputAmountElement} for at most {inputAmountElement}
        </>
      )}
      {toAddress && receiver && receiver !== owner && (
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
