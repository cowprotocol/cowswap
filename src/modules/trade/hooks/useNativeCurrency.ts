import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NativeCurrency } from '@uniswap/sdk-core'

import { GpEther as ETHER } from 'legacy/constants/tokens'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

export function useNativeCurrency(): NativeCurrency {
  const { chainId } = useWalletInfo()
  const activeChainId = supportedChainId(chainId)

  return useMemo(() => ETHER.onChain(activeChainId || SupportedChainId.MAINNET), [activeChainId])
}
