import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import useSWR, { SWRConfiguration } from 'swr'

import { BFF_BALANCES_SWR_CONFIG } from '../constants/bff-balances-swr-config'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { useSetIsBffFailed } from '../state/isBffFailedAtom'
import { isBffSupportedNetwork } from '../utils/isBffSupportedNetwork'

type BalanceResponse = {
  balances: Record<string, string> | null
}

export interface PersistBalancesFromBffParams {
  account?: string
  chainId: SupportedChainId
  balancesSwrConfig?: SWRConfiguration
  invalidateCacheTrigger?: number
  tokenAddresses: string[]
}

export function usePersistBalancesFromBff(params: PersistBalancesFromBffParams): void {
  const { account, chainId, invalidateCacheTrigger, tokenAddresses } = params

  const { chainId: activeChainId, account: connectedAccount } = useWalletInfo()
  const targetAccount = account ?? connectedAccount
  const targetChainId = chainId ?? activeChainId
  const isSupportedNetwork = isBffSupportedNetwork(targetChainId)

  const setIsBffFailed = useSetIsBffFailed()

  const lastTriggerRef = useRef(invalidateCacheTrigger)

  const {
    isLoading: isBalancesLoading,
    data,
    error,
  } = useSWR(
    targetAccount && isSupportedNetwork ? [targetAccount, targetChainId, invalidateCacheTrigger, 'bff-balances'] : null,
    ([walletAddress, chainId]) => {
      const skipCache = lastTriggerRef.current !== invalidateCacheTrigger
      lastTriggerRef.current = invalidateCacheTrigger
      return getBffBalances(walletAddress, chainId, skipCache)
    },
    BFF_BALANCES_SWR_CONFIG,
  )

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId: targetChainId }))
  }, [setBalances, isBalancesLoading, targetChainId, targetAccount])

  useEffect(() => {
    setIsBffFailed(!!error)
  }, [error, setIsBffFailed])

  useEffect(() => {
    if (!targetAccount || !data || error) return

    const balancesState = tokenAddresses.reduce<BalancesState['values']>((acc, address) => {
      address = address.toLowerCase()
      const balance = data[address] || '0'
      acc[address] = BigNumber.from(balance)
      return acc
    }, {})

    setBalances((state) => {
      return {
        ...state,
        chainId: targetChainId,
        fromCache: false,
        values: balancesState,
        isLoading: false,
      }
    })

    setBalancesUpdate((state) => ({
      ...state,
      [targetChainId]: {
        ...state[targetChainId],
        [targetAccount.toLowerCase()]: Date.now(),
      },
    }))
  }, [
    targetChainId,
    account,
    data,
    setBalances,
    setBalancesUpdate,
    error,
    tokenAddresses,
    isBalancesLoading,
    chainId,
    targetAccount,
  ])
}

export async function getBffBalances(
  address: string,
  chainId: SupportedChainId,
  skipCache = false,
): Promise<Record<string, string> | null> {
  const url = `${"localhost:8080"}/${chainId}/address/${address}/balances`
  const queryParams = skipCache ? '?ignoreCache=true' : ''
  const fullUrl = url + queryParams

  try {
    const res = await fetch(fullUrl)
    const data: BalanceResponse = await res.json()

    if (!res.ok) {
      return Promise.reject(new Error(`BFF error: ${res.status} ${res.statusText}`))
    }

    if (!data.balances) {
      return null
    }

    return data.balances
  } catch (error) {
    return Promise.reject(error)
  }
}
