import { useEffect, useMemo, useRef, useState } from 'react'

import { Config, useConnection, UseConnectionReturnType } from 'wagmi'

import { getCurrentChainIdFromUrl, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
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
  const [chainId, setChainId] = useState<SupportedChainId>(getCurrentChainIdFromUrl())
  const [solanaAccountState, setSolanaAccountState] = useState<UseAppKitAccountReturn | null>(null)

  // Chain explicitly present in the URL at load (user's pre-refresh selection), captured once.
  const [explicitUrlChainId] = useState(getRawCurrentChainIdFromUrl)
  const initialStateAppliedRef = useRef(false)

  const evmState = useConnection()

  useEffect(() => {
    if (!reownAppKit) return

    const subscriptions: Array<() => void> = []

    subscriptions.push(reownAppKit.subscribeAccount(setSolanaAccountState, 'solana'))

    subscriptions.push(
      reownAppKit.subscribeState((state) => {
        if (!state.selectedNetworkId) return

        const supportedChainId = CAIP_TO_SUPPORTED_CHAIN_ID[state.selectedNetworkId]
        if (!supportedChainId) return

        // The first chain reported after a (re)connect is the wallet's stored chain.
        // Don't let it override a chain the user explicitly had in the URL before a
        // refresh, otherwise the app switches networks unexpectedly on reload (#7863).
        // Chains the user switches to after reconnect are still applied normally.
        if (!initialStateAppliedRef.current) {
          initialStateAppliedRef.current = true
          if (explicitUrlChainId != null && explicitUrlChainId !== supportedChainId) return
        }

        setChainId(supportedChainId)
      }),
    )

    return () => {
      subscriptions.forEach((s) => s())
    }
  }, [explicitUrlChainId])

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
