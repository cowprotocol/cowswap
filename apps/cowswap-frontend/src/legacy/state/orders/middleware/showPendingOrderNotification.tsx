import { jotaiStore } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowEvents } from '@cowprotocol/events'
import { addSnackbarAtom } from '@cowprotocol/snackbars'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { EVENT_EMITTER } from 'eventEmitter'
import { Nullish } from 'types'

import {
  PendingOrderNotification,
  PendingOrderNotificationProps,
  getPendingOrderNotificationToast,
} from 'common/pure/PendingOrderNotification'
import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

interface PendingOrderNotificationParams {
  chainId: SupportedChainId
  id: string
  owner: string
  kind: OrderKind
  uiOrderType: UiOrderType
  receiver: Nullish<string>
  inputAmount: CurrencyAmount<Token>
  outputAmount: CurrencyAmount<Token>
  orderCreationHash?: string
  isHidden?: boolean
  isSafeWallet: boolean
}

export function showPendingOrderNotification(params: PendingOrderNotificationParams) {
  const {
    chainId,
    id,
    receiver,
    owner,
    uiOrderType,
    orderCreationHash,
    isHidden,
    inputAmount,
    outputAmount,
    isSafeWallet,
  } = params

  if (!isHidden) {
    const hasCustomRecipient = receiver?.toLowerCase() !== owner.toLowerCase()

    const pendingOrderNotificationMessage: PendingOrderNotificationProps = {
      chainId,
      account: owner,
      orderId: orderCreationHash || id,
      orderType: uiOrderType,
      kind: params.kind,
      receiver: receiver && hasCustomRecipient ? receiver : undefined,
      inputAmount: inputAmount,
      outputAmount: outputAmount,
      isSafeWallet,
    }

    const content = <PendingOrderNotification {...pendingOrderNotificationMessage} />
    jotaiStore.set(addSnackbarAtom, {
      id: 'pending-order',
      icon: 'success',
      content,
    })

    const toastMessage = getPendingOrderNotificationToast(pendingOrderNotificationMessage)
    if (toastMessage) {
      EVENT_EMITTER.emit(CowEvents.ON_TOAST_MESSAGE, toastMessage)
    }
  }
}
