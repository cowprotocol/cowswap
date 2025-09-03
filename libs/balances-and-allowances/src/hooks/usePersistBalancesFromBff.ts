import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

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
  setLoadingState?: boolean
  pendingOrdersCount?: number

  onBalancesLoaded?(loaded: boolean): void
}

export function usePersistBalancesFromBff(params: PersistBalancesFromBffParams): void {
  const { account, chainId, balancesSwrConfig, onBalancesLoaded, setLoadingState, pendingOrdersCount } = params

  const { chainId: activeChainId, account: connectedAccount } = useWalletInfo()
  const targetAccount = account ?? connectedAccount
  const targetChainId = chainId ?? activeChainId

  const setIsBffFailed = useSetIsBffFailed()

  const {
    isLoading: isBalancesLoading,
    data,
    error,
  } = useSWR(
    targetAccount ? [targetAccount, targetChainId, pendingOrdersCount, 'bff-balances'] : null,
    ([walletAddress, chainId]) => getBffBalances(walletAddress, chainId),
    balancesSwrConfig,
  )

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  useEffect(() => {
    if (!setLoadingState) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, chainId])

  if (error) {
    setIsBffFailed(true)
  }

  useEffect(() => {
    if (!account || !data || error) return

    const balancesState = Object.keys(data).reduce<BalancesState['values']>((acc, address) => {
      acc[address] = BigNumber.from(data[address])
      return acc
    }, {})

    onBalancesLoaded?.(true)

    setBalances((state) => {
      return {
        ...state,
        chainId,
        fromCache: false,
        values: balancesState,
        ...(setLoadingState ? { isLoading: false } : {}),
      }
    })

    if (setLoadingState) {
      setBalancesUpdate((state) => ({
        ...state,
        [chainId]: {
          ...state[chainId],
          [account.toLowerCase()]: Date.now(),
        },
      }))
    }
  }, [chainId, account, data, setBalances, setLoadingState, onBalancesLoaded, setBalancesUpdate, error])
}

export async function getBffBalances(
  address: string,
  chainId: SupportedChainId,
): Promise<Record<string, string> | null> {
  const url = `${BFF_BASE_URL}/${chainId}/tokens/${address}/balances`

  try {
    const res = await fetch(url)
    const data: BalanceResponse = await res.json()

    if (!data.balances) {
      return null
    }

    return data.balances
  } catch (error) {
    return Promise.reject(error)
  }
}
