import { useCallback } from 'react'

import { isCowOrder } from '@cowprotocol/common-utils'
import { OnPostedOrderPayload } from '@cowprotocol/events'

import { Trans } from '@lingui/react/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { getUiOrderTypeTitles } from 'utils/orderUtils/getUiOrderType'

import { OrderLinkWrapper } from '../commonStyled'
import { OrderSummary } from '../OrderSummary'
import { ReceiverInfo } from '../ReceiverInfo'

export interface PendingOrderNotificationProps {
  payload: OnPostedOrderPayload
  isSafeWallet: boolean
  onToastMessage(message: string): void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    [onToastMessage],
  )

  return (
    <>
      <div ref={ref}>
        <strong>
          {getUiOrderTypeTitles()[orderType]} <Trans>submitted</Trans>
        </strong>
        <br />
        {inputToken && outputToken && (
          <OrderSummary
            kind={kind}
            inputToken={inputToken}
            outputToken={outputToken}
            sellAmount={inputAmountRaw.toString()}
            buyAmount={outputAmountRaw.toString()}
          />
        )}
        <ReceiverInfo receiver={receiver} owner={owner} />
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
