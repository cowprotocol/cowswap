import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { Address, areAddressesEqual, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { orderBookApi } from 'cowSdk'
import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { OrderStatus } from 'legacy/state/orders/actions'
import { flatOrdersStateNetwork } from 'legacy/state/orders/flatOrdersStateNetwork'
import { getDefaultNetworkState, OrdersState } from 'legacy/state/orders/reducer'

import { getOrders } from 'api/cowProtocol'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { extractFullAppDataFromResponse, getAppDataHash, getReferrerCodeFromAppData } from '../lib/traderActivity'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'
import { setRecoveredTraderReferralCodeAtom } from '../state/affiliateTraderWriteAtoms'
import { logAffiliate } from '../utils/logger'

const ORDERBOOK_RECOVERY_LIMIT_PER_CHAIN = 30

type AppDataGetter = {
  getAppData?: (appDataHash: string, context: { chainId: SupportedChainId }) => Promise<unknown>
}

export function useRecoverTraderReferralCode(): void {
  const { account } = useWalletInfo()
  const { isLinked } = useAtomValue(affiliateTraderAtom)
  const setRecoveredCode = useSetAtom(setRecoveredTraderReferralCodeAtom)
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)
  const attemptedAccountsRef = useRef<Set<string>>(new Set())

  const localCode = useMemo(() => {
    if (!account || !ordersState || isLinked) {
      return undefined
    }

    return getReferrerCodeFromLocalOrders(ordersState, account)
  }, [account, isLinked, ordersState])

  useEffect(() => {
    if (!account || isLinked) {
      return
    }

    if (localCode) {
      logAffiliate('Recovered trader referral code from local orders:', localCode)
      setRecoveredCode(localCode)
      return
    }

    const accountKey = account.toLowerCase()
    if (attemptedAccountsRef.current.has(accountKey)) {
      return
    }

    attemptedAccountsRef.current.add(accountKey)

    let isCancelled = false

    const recoverFromOrderbook = async (): Promise<void> => {
      const recoveredCode = await getReferrerCodeFromOrderbook(account)

      if (isCancelled || !recoveredCode) {
        return
      }

      logAffiliate('Recovered trader referral code from orderbook appData:', recoveredCode)
      setRecoveredCode(recoveredCode)
    }

    recoverFromOrderbook()

    return () => {
      isCancelled = true
    }
  }, [account, isLinked, localCode, setRecoveredCode])
}

function getReferrerCodeFromLocalOrders(ordersState: OrdersState, account: string): string | undefined {
  for (const [networkId, networkState] of Object.entries(ordersState)) {
    const fullState = { ...getDefaultNetworkState(Number(networkId)), ...(networkState || {}) }
    const ordersMap = flatOrdersStateNetwork(fullState)

    for (const orderState of Object.values(ordersMap)) {
      const order = orderState?.order

      if (
        !order ||
        order.status !== OrderStatus.FULFILLED ||
        !order.owner ||
        !areAddressesEqual(order.owner, account)
      ) {
        continue
      }

      const codeFromOrder = getReferrerCodeFromOrder(order)
      if (codeFromOrder) {
        return codeFromOrder
      }
    }
  }

  return undefined
}

async function getReferrerCodeFromOrderbook(account: string): Promise<string | undefined> {
  const appDataCache = new Map<string, Promise<string | undefined>>()

  for (const chainId of AFFILIATE_SUPPORTED_CHAIN_IDS) {
    const chainOrders = await getOrdersByChain(account, chainId)

    for (const order of chainOrders) {
      const code = await getReferrerCodeFromOrderWithFallback(order, chainId, appDataCache)

      if (code) {
        return code
      }
    }
  }

  return undefined
}

async function getOrdersByChain(account: string, chainId: SupportedChainId): Promise<unknown[]> {
  try {
    return await getOrders(
      {
        owner: account as Address,
        limit: ORDERBOOK_RECOVERY_LIMIT_PER_CHAIN,
      },
      { chainId },
    )
  } catch (error) {
    logAffiliate('Failed to fetch orders for referral recovery. chainId:', chainId, error)
    return []
  }
}

function getReferrerCodeFromOrder(order: unknown): string | undefined {
  const fullAppData = extractFullAppDataFromResponse(order) || getApiAdditionalInfoFullAppData(order)
  return getReferrerCodeFromAppData(fullAppData)
}

async function getReferrerCodeFromOrderWithFallback(
  order: unknown,
  chainId: SupportedChainId,
  appDataCache: Map<string, Promise<string | undefined>>,
): Promise<string | undefined> {
  const codeFromOrder = getReferrerCodeFromOrder(order)

  if (codeFromOrder) {
    return codeFromOrder
  }

  const appDataHash = getAppDataHash(order)
  if (!appDataHash) {
    return undefined
  }

  const cacheKey = `${chainId}:${appDataHash.toLowerCase()}`
  const cachedRequest = appDataCache.get(cacheKey)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = fetchReferrerCodeByHash(appDataHash, chainId)
  appDataCache.set(cacheKey, request)

  return request
}

function getApiAdditionalInfoFullAppData(order: unknown): string | undefined {
  if (!order || typeof order !== 'object') {
    return undefined
  }

  const additionalInfo = (order as { apiAdditionalInfo?: unknown }).apiAdditionalInfo
  return extractFullAppDataFromResponse(additionalInfo)
}

async function fetchReferrerCodeByHash(appDataHash: string, chainId: SupportedChainId): Promise<string | undefined> {
  const appDataGetter = orderBookApi as unknown as AppDataGetter

  if (!appDataGetter.getAppData) {
    return undefined
  }

  try {
    const response = await appDataGetter.getAppData(appDataHash, { chainId })
    const fullAppData = extractFullAppDataFromResponse(response)
    return getReferrerCodeFromAppData(fullAppData)
  } catch (error) {
    logAffiliate('Failed to fetch appData by hash for referral recovery:', appDataHash, chainId, error)
    return undefined
  }
}
