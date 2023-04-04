import { Currency } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'

import EthereumLogo from 'assets/images/ethereum-logo.png'
// import MaticLogo from '../../assets/svg/matic-token-icon.svg'

// MOD imports
import XDaiLogo from 'assets/cow-swap/xdai.png'
import { ADDRESS_IMAGE_OVERRIDE } from 'constants/tokens'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import uriToHttp from 'lib/utils/uriToHttp'
import { useExternalTokenLogo } from '@cow/common/hooks/useExternalTokenLogo'

type Network = 'ethereum' | /*'arbitrum' | 'optimism'*/ 'xdai' | 'rinkeby'

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return 'ethereum'
    // mod
    case SupportedChainId.GNOSIS_CHAIN:
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
    case SupportedChainId.GNOSIS_CHAIN:
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
  const networksWithUrls = [SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN]
  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}

const currencyLogoCache = new Map<string, Array<string>>()
// TODO: must be refactored
export default function useCurrencyLogoURIs(currency?: Currency | null): string[] {
  const externalLogo = useExternalTokenLogo(currency)
  // There is a modification of Token in useDetectNativeToken()
  const currencyAddress = currency ? (currency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : currency.address) : null
  const cacheKey = `${currencyAddress}|${currency?.chainId}`
  const cached = currencyLogoCache.get(cacheKey)

  if (cached) return cached

  const logoURI = currency ? (currency as Currency & { logoURI: string }).logoURI : null
  const logoURIs = logoURI ? uriToHttp(logoURI) : []

  if (!currency) {
    return []
  }

  // mod: CoW Swap Native buy orders have address set to EeeEE... rather than `isNative` flag
  if (currency.isNative || currency.address === NATIVE_CURRENCY_BUY_ADDRESS) {
    logoURIs.push(getNativeLogoURI(currency.chainId))
  } else if (currency.isToken) {
    // mod
    // Explicit overrides should take priority, otherwise append potential other logoURIs to existing candidates
    const imageOverride = ADDRESS_IMAGE_OVERRIDE[currency.address]
    if (imageOverride) {
      // Add image override with higher priority
      logoURIs.unshift(imageOverride)
    }

    // Last resource, we get the logo from @Uniswap/assets
    const logoURI = getTokenLogoURI(currency.address, currency.chainId)
    if (logoURI) {
      logoURIs.push(logoURI)
    }

    if (externalLogo) {
      logoURIs.push(externalLogo)
    }
  }

  currencyLogoCache.set(`${currencyAddress}|${currency?.chainId}`, logoURIs)

  return logoURIs
}
