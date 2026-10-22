import type { OrderBookApi, SupportedChainId } from '@cowprotocol/cow-sdk'
import { setWalletTransactionGuard } from '@cowprotocol/wallet'

import { orderBookApi, prodOrderBookApi } from 'cowSdk'

import {
  assertAppDataHasNoRestrictedAddresses,
  assertOrderHasNoRestrictedAddresses,
  assertTransactionsHaveNoRestrictedAddresses,
} from './assertNoRestrictedAddresses.service'

export function installRestrictedAddressesGuard(): void {
  setWalletTransactionGuard((transactions, chainId) =>
    assertTransactionsHaveNoRestrictedAddresses(transactions, chainId as SupportedChainId),
  )

  new Set([orderBookApi, prodOrderBookApi]).forEach(guardOrderBookApi)
}

function guardOrderBookApi(api: OrderBookApi): void {
  const sendOrder = api.sendOrder.bind(api)
  const uploadAppData = api.uploadAppData.bind(api)

  api.sendOrder = async (requestBody, contextOverride) => {
    assertOrderHasNoRestrictedAddresses(requestBody, contextOverride?.chainId ?? api.context.chainId)

    return sendOrder(requestBody, contextOverride)
  }

  api.uploadAppData = async (appDataHash, fullAppData, contextOverride) => {
    assertAppDataHasNoRestrictedAddresses(fullAppData, contextOverride?.chainId ?? api.context.chainId)

    return uploadAppData(appDataHash, fullAppData, contextOverride)
  }
}
