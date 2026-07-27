import { useEffect, useMemo, useState } from 'react'

import { Config, useConnection, UseConnectionReturnType } from 'wagmi'

import { getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { UseAppKitAccountReturn } from '@reown/appkit'

import { CAIP_TO_SUPPORTED_CHAIN_ID } from '../../constants'
import { reownAppKit } from '../config'

export type AccountState = EvmOrBitcoinAccountState | SolanaAccountState

type EvmOrBitcoinAccountState = Omit<UseConnectionReturnType<Config>, 'chainId'> & {
  chainId: SupportedChainId
}

type SolanaAccountState = UseAppKitAccountReturn & {
  chainId: SupportedChainId.SOLANA
  connector?: never
}

export function useAccountState(): AccountState {
  const [chainId, setChainId] = useState<SupportedChainId>(getInitialChainId)
  const [solanaAccountState, setSolanaAccountState] = useState<UseAppKitAccountReturn | null>(null)

  const evmState = useConnection()

  useEffect(() => {
    if (!reownAppKit) return

    const subscriptions: Array<() => void> = []

    subscriptions.push(reownAppKit.subscribeAccount(setSolanaAccountState, 'solana'))

    subscriptions.push(
      reownAppKit.subscribeState((state) => {
        if (state.selectedNetworkId) {
          const supportedChainId = CAIP_TO_SUPPORTED_CHAIN_ID[state.selectedNetworkId]
          if (supportedChainId) {
            setChainId(supportedChainId)
          }
        }
      }),
    )

    return () => {
      subscriptions.forEach((s) => s())
    }
  }, [])

  return useMemo(() => {
    if (chainId === SupportedChainId.SOLANA && solanaAccountState) {
      return {
        ...solanaAccountState,
        chainId,
      }
    }
    return {
      ...evmState,
      chainId,
    }
  }, [chainId, evmState, solanaAccountState])
}

/**
 * Seed the initial chainId from the connection AppKit restored on load.
 *
 * `subscribeState` only emits on *changes*, so the restored network (set during AppKit init,
 * before this hook subscribes) is not delivered on mount. Reading `getCaipNetwork()` directly
 * reflects it immediately — otherwise a refreshed Solana session shows as disconnected until
 * some interaction (e.g. opening the wallet modal) mutates the state and triggers an emit.
 *
 * The URL still wins when it names a chain (e.g. /137/swap); the restored network is only used
 * when there is none (e.g. /account), mirroring `getReownDefaultNetwork`.
 */
function getInitialChainId(): SupportedChainId {
  const urlChainId = getRawCurrentChainIdFromUrl()
  if (urlChainId !== null) return urlChainId

  const caipNetworkId = reownAppKit?.getCaipNetwork()?.caipNetworkId
  const restoredChainId = caipNetworkId ? CAIP_TO_SUPPORTED_CHAIN_ID[caipNetworkId] : undefined

  return restoredChainId ?? SupportedChainId.MAINNET
}
