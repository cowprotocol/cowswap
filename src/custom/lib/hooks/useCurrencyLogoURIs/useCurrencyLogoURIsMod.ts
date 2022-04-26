import { Currency } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import useHttpLocations from 'hooks/useHttpLocations'
import { useMemo } from 'react'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

import EthereumLogo from 'assets/images/ethereum-logo.png'
// import MaticLogo from '../../assets/svg/matic-token-icon.svg'

// MOD imports
import XDaiLogo from 'assets/cow-swap/xdai.png'
import { ADDRESS_IMAGE_OVERRIDE } from 'constants/tokens'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'

type Network = 'ethereum' | /*'arbitrum' | 'optimism'*/ 'xdai' | 'rinkeby'

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return 'ethereum'
    // mod
    case SupportedChainId.XDAI:
      return 'xdai'
    /* case SupportedChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case SupportedChainId.OPTIMISM:
      return 'optimism' */
    default:
      return 'ethereum'
  }
}

function getNativeLogoURI(chainId: SupportedChainId = SupportedChainId.MAINNET): string {
  switch (chainId) {
    // mod
    case SupportedChainId.XDAI:
      return XDaiLogo
    /*case SupportedChainId.POLYGON_MUMBAI:
    case SupportedChainId.POLYGON:
      return MaticLogo*/
    default:
      return EthereumLogo
  }
}

function getTokenLogoURI(address: string, chainId: SupportedChainId = SupportedChainId.MAINNET): string | void {
  const networkName = chainIdToNetworkName(chainId)
  // const networksWithUrls = [SupportedChainId.ARBITRUM_ONE, SupportedChainId.MAINNET, SupportedChainId.OPTIMISM]
  const networksWithUrls = [SupportedChainId.MAINNET, SupportedChainId.XDAI]
  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}

export default function useCurrencyLogoURIs(currency?: Currency | null): string[] {
  const locations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  return useMemo(() => {
    const logoURIs = [...locations]
    if (currency) {
      // mod: CowSwap Native buy orders have address set to EeeEE... rather than `isNative` flag
      if (currency.isNative || currency.address === NATIVE_CURRENCY_BUY_ADDRESS) {
        logoURIs.push(getNativeLogoURI(currency.chainId))
      } else if (currency.isToken) {
        // mod
        const imageOverride = ADDRESS_IMAGE_OVERRIDE[currency.address]
        const logoURI = imageOverride || getTokenLogoURI(currency.address, currency.chainId)
        if (logoURI) {
          logoURIs.push(logoURI)
        }
      }
    }
    return logoURIs
  }, [currency, locations])
}
