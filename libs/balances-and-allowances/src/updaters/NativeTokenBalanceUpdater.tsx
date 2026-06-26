import { useEffect } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { useUpdateTokenBalance } from '../hooks/useUpdateTokenBalance'

export interface NativeTokenBalanceUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
}

/**
 * Writes the connected wallet's native token balance into `balancesAtom`.
 * The balances-watcher SSE stream does not emit native amounts, so we keep
 * polling via wagmi's `eth_getBalance` (single RPC call, no multicall).
 */
export function NativeTokenBalanceUpdater({ account, chainId }: NativeTokenBalanceUpdaterProps): null {
  const updateTokenBalance = useUpdateTokenBalance()
  const nativeTokenBalanceData = useNativeTokenBalance(account, chainId)
  const nativeTokenBalance = nativeTokenBalanceData.data?.value

  useEffect(() => {
    const nativeToken = NATIVE_CURRENCIES[chainId]

    // FIXME: remove after testing
    console.log('NATIVE TOKEN BALANCE', { nativeToken, nativeTokenBalance })

    if (nativeToken && typeof nativeTokenBalance !== 'undefined') {
      updateTokenBalance(nativeToken.address, nativeTokenBalance)
    }
  }, [nativeTokenBalance, chainId, updateTokenBalance])

  return null
}
