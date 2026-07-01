import { useMemo } from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { useSelectTokenWidgetState } from 'modules/tokensList'

const EMPTY_ADDRESSES: AddressKey[] = []

/** Bridge buy-tokens for `chainId`, only while the token selector is open with `chainId` as the bridge target. */
export function useBridgeCustomTokensForChain(chainId: SupportedChainId): AddressKey[] {
  const { chainId: walletChainId } = useWalletInfo()
  const { open, oppositeToken } = useSelectTokenWidgetState()

  const params = useMemo<BuyTokensParams | undefined>(() => {
    if (!open) return undefined

    const sellChainId = oppositeToken?.chainId ?? walletChainId
    if (chainId === sellChainId) return undefined

    return { buyChainId: chainId, sellChainId }
  }, [open, oppositeToken, walletChainId, chainId])

  const { data } = useBridgeSupportedTokens(params)

  return useMemo(() => {
    const tokens = data?.tokens
    if (!tokens?.length) return EMPTY_ADDRESSES

    const addresses: AddressKey[] = []
    for (const token of tokens) {
      if (token.chainId !== chainId) continue
      addresses.push(getAddressKey(token.address))
    }
    return addresses.length === 0 ? EMPTY_ADDRESSES : addresses
  }, [data, chainId])
}
