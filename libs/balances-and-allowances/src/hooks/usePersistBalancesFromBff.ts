import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { useSetIsBffFailed } from '../state/isBffFailedAtom'

type BalanceResponse = {
  balances: Record<string, string> | null
}

export interface PersistBalancesFromBffParams {
  account?: string
  chainId: SupportedChainId
  balancesSwrConfig: SWRConfiguration
  pendingOrdersCount?: number
  tokenAddresses: string[]
}

const DEBOUNCE_FOR_PENDING_ORDERS_MS = ms`1s`

export function usePersistBalancesFromBff(params: PersistBalancesFromBffParams): void {
  const { account, chainId, balancesSwrConfig, pendingOrdersCount, tokenAddresses } = params

  const { chainId: activeChainId, account: connectedAccount } = useWalletInfo()
  const targetAccount = account ?? connectedAccount
  const targetChainId = chainId ?? activeChainId

  const setIsBffFailed = useSetIsBffFailed()
  const debouncedPendingOrdersCount = useDebounce(pendingOrdersCount, DEBOUNCE_FOR_PENDING_ORDERS_MS)

  const {
    isLoading: isBalancesLoading,
    data,
    error,
  } = useSWR(
    // debouncedPendingOrdersCount is added to the key to refetch balances when it changes (new order created or order filled)
    targetAccount ? [targetAccount, targetChainId, debouncedPendingOrdersCount, 'bff-balances'] : null,
    ([walletAddress, chainId, _]) => getBffBalances(walletAddress, chainId),
    balancesSwrConfig,
  )

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, chainId, targetAccount])

  useEffect(() => {
    if (error) {
      setIsBffFailed(true)
    }
  }, [error, setIsBffFailed])

  useEffect(() => {
    if (!account || !data || error) return

    const balancesState = tokenAddresses.reduce<BalancesState['values']>((acc, address) => {
      address = address.toLowerCase()
      const balance = data[address] || '0'
      acc[address] = BigNumber.from(balance)
      return acc
    }, {})

    setBalances((state) => {
      return {
        ...state,
        chainId,
        fromCache: false,
        values: balancesState,
        isLoading: false,
      }
    })

    setBalancesUpdate((state) => ({
      ...state,
      [chainId]: {
        ...state[chainId],
        [account.toLowerCase()]: Date.now(),
      },
    }))
  }, [chainId, account, data, setBalances, setBalancesUpdate, error, tokenAddresses, isBalancesLoading])
}

export async function getBffBalances(
  address: string,
  chainId: SupportedChainId,
): Promise<Record<string, string> | null> {
  const url = `${BFF_BASE_URL}/${chainId}/address/${address}/balances`

  try {
    const res = await fetch(url)
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
