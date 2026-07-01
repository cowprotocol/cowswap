import { useEffect, useMemo, useState } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { UseAppKitAccountReturn } from '@reown/appkit'
import { Config, useConnection, UseConnectionReturnType } from 'wagmi'

import { CAIP_TO_SUPPORTED_CHAIN_ID } from '../../constants'
import { reownAppKit } from '../config'

type EvmOrBitcoinAccountState = Omit<UseConnectionReturnType<Config>, 'chainId'> & {
  chainId: SupportedChainId
}

type SolanaAccountState = UseAppKitAccountReturn & {
  chainId: SupportedChainId.SOLANA
  connector?: never
}

export type AccountState = EvmOrBitcoinAccountState | SolanaAccountState

export function useAccountState(): AccountState {
  const [chainId, setChainId] = useState<SupportedChainId>(getCurrentChainIdFromUrl())
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
