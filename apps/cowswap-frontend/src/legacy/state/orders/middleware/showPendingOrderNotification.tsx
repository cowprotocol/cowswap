import { jotaiStore } from '@cowprotocol/core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { addSnackbarAtom } from '@cowprotocol/snackbars'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { PendingOrderNotification } from 'common/containers/PendingOrderNotification'
import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

interface PendingOrderNotificationParams {
  id: string
  owner: string
  kind: OrderKind
  uiOrderType: UiOrderType
  receiver: Nullish<string>
  inputAmount: CurrencyAmount<Token>
  outputAmount: CurrencyAmount<Token>
  orderCreationHash?: string
  isHidden?: boolean
}

export function showPendingOrderNotification(order: PendingOrderNotificationParams) {
  const { id, receiver, owner, uiOrderType, orderCreationHash, isHidden, inputAmount, outputAmount } = order

  if (!isHidden) {
    const hasCustomRecipient = receiver?.toLowerCase() !== owner.toLowerCase()

    jotaiStore.set(addSnackbarAtom, {
      id: 'pending-order',
      icon: 'success',
      content: (
        <PendingOrderNotification
          orderId={orderCreationHash || id}
          orderType={uiOrderType}
          kind={order.kind}
          receiver={receiver && hasCustomRecipient ? receiver : undefined}
          inputAmount={inputAmount}
          outputAmount={outputAmount}
        />
      ),
    })
  }
}
