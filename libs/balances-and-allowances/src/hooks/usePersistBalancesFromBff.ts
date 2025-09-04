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
  pendingOrdersCount?: number
}

export function usePersistBalancesFromBff(params: PersistBalancesFromBffParams): void {
  const { account, chainId, balancesSwrConfig, pendingOrdersCount } = params

  const { chainId: activeChainId, account: connectedAccount } = useWalletInfo()
  const targetAccount = account ?? connectedAccount
  const targetChainId = chainId ?? activeChainId

  const setIsBffFailed = useSetIsBffFailed()

  const {
    isLoading: isBalancesLoading,
    data,
    error,
  } = useSWR(
    // pendingOrdersCount is added to the key to refetch balances when it changes (new order created or order filled)
    targetAccount ? [targetAccount, targetChainId, pendingOrdersCount, 'bff-balances'] : null,
    ([walletAddress, chainId]) => getBffBalances(walletAddress, chainId),
    balancesSwrConfig,
  )

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, chainId])

  if (error) {
    setIsBffFailed(true)
  }

  useEffect(() => {
    if (!account || !data || error) return

    const balancesState = Object.keys(data).reduce<BalancesState['values']>((acc, address) => {
      acc[address] = BigNumber.from(data[address])
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
  }, [chainId, account, data, setBalances, setBalancesUpdate, error])
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
