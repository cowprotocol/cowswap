import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`30s`,
  revalidateOnFocus: false,
}

export function useNativeBalance(): SWRResponse<CurrencyAmount<TokenWithLogo> | null> {
  const { provider } = useWeb3React()
  const { account, chainId } = useWalletInfo()

  return useSWR<CurrencyAmount<TokenWithLogo> | null>(
    ['useNativeBalance', provider, account],
    () => {
      if (!account || !provider) return null

      const nativeToken = NATIVE_CURRENCIES[chainId]

      return provider.getBalance(account).then((res) => CurrencyAmount.fromRawAmount(nativeToken, res.toHexString()))
    },
    swrOptions
  )
}
