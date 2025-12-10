import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import useSWR, { SWRConfiguration } from 'swr'

import { BFF_BALANCES_SWR_CONFIG } from '../constants/bff-balances-swr-config'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { useAddUnsupportedChainId, useSetIsBffFailed } from '../state/isBffFailedAtom'
import { useIsBffSupportedNetwork } from '../utils/isBffSupportedNetwork'
import { UnsupportedChainError, isUnsupportedChainError } from '../utils/UnsupportedChainError'

type BalanceResponse = {
  balances: Record<string, string> | null
  message?: string
}

export interface PersistBalancesFromBffParams {
  account?: string
  chainId: SupportedChainId
  balancesSwrConfig?: SWRConfiguration
  invalidateCacheTrigger?: number
  tokenAddresses: string[]
}

function isUnsupportedChainMessage(errorMessage: string): boolean {
  return errorMessage.toLowerCase().includes('unsupported chain')
}

function parseErrorResponse(data: unknown, statusText: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return String(data.message)
  }
  return statusText
}

async function parseBffResponse(res: Response): Promise<BalanceResponse | { message?: string }> {
  try {
    return await res.json()
  } catch {
    return { message: res.statusText }
  }
}

function handleBffError(res: Response, data: BalanceResponse | { message?: string }): never {
  const errorMessage = parseErrorResponse(data, res.statusText)

  if (isUnsupportedChainMessage(errorMessage)) {
    throw new UnsupportedChainError()
  }

  throw new Error(`BFF error: ${res.status} ${res.statusText}`)
}

export function usePersistBalancesFromBff(params: PersistBalancesFromBffParams): void {
  const { account, chainId, invalidateCacheTrigger, tokenAddresses } = params

  const { chainId: activeChainId, account: connectedAccount } = useWalletInfo()
  const targetAccount = account ?? connectedAccount
  const targetChainId = chainId ?? activeChainId
  const isSupportedNetwork = useIsBffSupportedNetwork(targetChainId)

  const setIsBffFailed = useSetIsBffFailed()
  const addUnsupportedChainId = useAddUnsupportedChainId()

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
    const hasUnsupportedChainError = isUnsupportedChainError(error)

    if (hasUnsupportedChainError) {
      addUnsupportedChainId(targetChainId)
    }

    setIsBffFailed(!!error)
  }, [error, setIsBffFailed, addUnsupportedChainId, targetChainId])

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
  const url = `${BFF_BASE_URL}/${chainId}/address/${address}/balances`
  const queryParams = skipCache ? '?ignoreCache=true' : ''
  const fullUrl = url + queryParams

  try {
    const res = await fetch(fullUrl)
    const data = await parseBffResponse(res)

    if (!res.ok) {
      handleBffError(res, data)
    }

    if (!('balances' in data) || !data.balances) {
      return null
    }

    return data.balances
  } catch (error) {
    if (isUnsupportedChainError(error)) {
      throw new UnsupportedChainError()
    }
    throw error
  }
}
