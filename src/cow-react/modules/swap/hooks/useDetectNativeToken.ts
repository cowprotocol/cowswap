import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Token } from '@uniswap/sdk-core'

import { WETH_LOGO_URI } from 'constants/index'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { WRAPPED_NATIVE_CURRENCY as WETH, GpEther as ETHER } from 'constants/tokens'
import { supportedChainId } from 'utils/supportedChainId'
import WXDAI_LOGO_URI from 'assets/cow-swap/wxdai.png'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'
import { SupportedChainId as ChainId } from 'constants/chains'
import { useTradeState } from '@cow/modules/trade/hooks/useTradeState'

// TODO: move it to `modules/trade`
export function useDetectNativeToken() {
  const { chainId } = useWeb3React()
  const tradeState = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = tradeState?.state || {}

  const input = useTokenBySymbolOrAddress(inputCurrencyId)
  const output = useTokenBySymbolOrAddress(outputCurrencyId)

  return useMemo(() => {
    const activeChainId = supportedChainId(chainId)
    const wrappedToken: Token & { logoURI: string } = Object.assign(
      WETH[activeChainId || DEFAULT_NETWORK_FOR_LISTS].wrapped,
      {
        logoURI: activeChainId === ChainId.GNOSIS_CHAIN ? WXDAI_LOGO_URI : WETH_LOGO_URI,
      }
    )

    // TODO: check the new native currency function
    const native = ETHER.onChain(activeChainId || DEFAULT_NETWORK_FOR_LISTS)

    const [isNativeIn, isNativeOut] = [!!input?.isNative, !!output?.isNative]
    const [isWrappedIn, isWrappedOut] = [!!input?.equals(wrappedToken), !!output?.equals(wrappedToken)]

    return {
      isNativeIn,
      isNativeOut,
      isWrappedIn,
      isWrappedOut,
      wrappedToken,
      native,
      isWrapOrUnwrap: (isNativeIn && isWrappedOut) || (isNativeOut && isWrappedIn),
    }
  }, [input, output, chainId])
}
