import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { useWalletInfo } from 'modules/wallet'

import { estimatePermit } from 'utils/permitTokenChecker'

const PERMITTABLE_TOKENS_CACHE: Record<SupportedChainId, Record<string, boolean>> = {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GOERLI]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
}

export function useIsTokenPermittable(token: Nullish<Currency>): boolean | undefined {
  const { chainId, account } = useWalletInfo()
  const { provider } = useWeb3React()

  const lowerCaseAddress = token?.wrapped?.address?.toLowerCase()
  const isNative = token?.isNative
  const tokenName = token?.name || 'Token'

  useEffect(() => {
    if (!chainId || !lowerCaseAddress || !provider || !account) {
      return
    }

    estimatePermit(lowerCaseAddress, tokenName, chainId, account, provider).then((a) => {
      PERMITTABLE_TOKENS_CACHE[chainId][lowerCaseAddress] = a?.supported
    })
  }, [account, chainId, lowerCaseAddress, provider, tokenName])

  return chainId && lowerCaseAddress && !isNative ? PERMITTABLE_TOKENS_CACHE[chainId][lowerCaseAddress] : undefined
}
