import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress, isCowOrder, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { OnPostedOrderPayload } from '@cowprotocol/events'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { ORDER_UI_TYPE_TITLES } from 'utils/orderUtils/getUiOrderType'

import { OrderLinkWrapper } from '../commonStyled'

export interface PendingOrderNotificationProps {
  payload: OnPostedOrderPayload
  isSafeWallet: boolean
  onToastMessage(message: string): void
}

export function PendingOrderNotification(props: PendingOrderNotificationProps) {
  const { payload, isSafeWallet, onToastMessage } = props

  const {
    inputToken,
    inputAmount: inputAmountRaw,
    outputAmount: outputAmountRaw,
    outputToken,
    kind,
    receiver,
    orderCreationHash,
    orderUid,
    owner,
    orderType,
    chainId,
  } = payload

  const inputAmount = useMemo(
    () => CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(inputToken), inputAmountRaw.toString()),
    [inputAmountRaw, inputToken]
  )

  const outputAmount = useMemo(
    () => CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(outputToken), outputAmountRaw.toString()),
    [outputAmountRaw, outputToken]
  )

  const isSell = isSellOrder(kind)
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount.currency} />

  const tx = {
    hash: orderCreationHash || orderUid,
    hashType:
      isSafeWallet && !isCowOrder('transaction', orderCreationHash) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: orderCreationHash || '',
      safe: owner,
    },
  }

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  return (
    <>
      <div ref={ref}>
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
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
