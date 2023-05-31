import { useMemo } from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import WXDAI_LOGO_URI from 'legacy/assets/cow-swap/wxdai.png'
import { WETH_LOGO_URI } from 'legacy/constants'
import { DEFAULT_NETWORK_FOR_LISTS } from 'legacy/constants/lists'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'legacy/constants/tokens'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { useWalletInfo } from 'modules/wallet'

import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'

import { useNativeCurrency } from './useNativeCurrency'

export function useDetectNativeToken() {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  const input = useTokenBySymbolOrAddress(inputCurrencyId)
  const output = useTokenBySymbolOrAddress(outputCurrencyId)

  const native = useNativeCurrency()

  return useMemo(() => {
    const activeChainId = supportedChainId(chainId)
    const wrappedToken: Token & { logoURI: string } = Object.assign(
      WETH[activeChainId || DEFAULT_NETWORK_FOR_LISTS].wrapped,
      {
        logoURI: activeChainId === ChainId.GNOSIS_CHAIN ? WXDAI_LOGO_URI : WETH_LOGO_URI,
      }
    )

    const [isNativeIn, isNativeOut] = [!!input?.isNative, !!output?.isNative]
    const [isWrappedIn, isWrappedOut] = [!!input?.equals(wrappedToken), !!output?.equals(wrappedToken)]

    return {
      isNativeIn,
      isNativeOut,
      isWrappedIn,
      isWrappedOut,
      wrappedToken,
      native,
    }
  }, [chainId, input, output, native])
}
