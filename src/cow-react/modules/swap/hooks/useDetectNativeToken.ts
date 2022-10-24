import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Token } from '@uniswap/sdk-core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { WETH_LOGO_URI } from 'constants/index'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { WRAPPED_NATIVE_CURRENCY as WETH, GpEther as ETHER } from 'constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import { useSwapState } from 'state/swap/hooks'
import { supportedChainId } from 'utils/supportedChainId'
import { Field } from 'state/swap/actions'
import WXDAI_LOGO_URI from 'assets/cow-swap/wxdai.png'

export function useDetectNativeToken() {
  const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const input = useCurrency(inputCurrencyId)
  const output = useCurrency(outputCurrencyId)

  return useMemo(() => {
    const activeChainId = supportedChainId(chainId)
    const wrappedToken: Token & { logoURI: string } = Object.assign(
      WETH[activeChainId || DEFAULT_NETWORK_FOR_LISTS].wrapped,
      {
        logoURI: activeChainId === SupportedChainId.GNOSIS_CHAIN ? WXDAI_LOGO_URI : WETH_LOGO_URI,
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
