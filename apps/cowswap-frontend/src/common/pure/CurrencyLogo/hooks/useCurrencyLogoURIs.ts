import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import XDaiLogo from 'legacy/assets/cow-swap/xdai.png'
import EthereumLogo from 'legacy/assets/images/ethereum-logo.png'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'
import { ADDRESS_IMAGE_OVERRIDE } from 'legacy/constants/tokens'

import { useProxyTokenLogo } from 'api/proxy'
import uriToHttp from 'lib/utils/uriToHttp'

type Network = 'ethereum' | 'xdai'

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return 'ethereum'
    // mod
    case SupportedChainId.GNOSIS_CHAIN:
      return 'xdai'
    default:
      return 'ethereum'
  }
}
function getNativeLogoURI(chainId: SupportedChainId = SupportedChainId.MAINNET): string {
  switch (chainId) {
    case SupportedChainId.GNOSIS_CHAIN:
      return XDaiLogo
    default:
      return EthereumLogo
  }
}

function getTokenLogoURI(address: string, chainId: SupportedChainId = SupportedChainId.MAINNET): string | void {
  const networkName = chainIdToNetworkName(chainId)
  const networksWithUrls = [SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN]

  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}

const currencyLogoCache = new Map<string, Array<string>>()

// TODO: must be refactored
export default function useCurrencyLogoURIs(currency?: Currency | null): string[] {
  const currencyAddress = currency ? (currency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : currency.address) : null
  // There is a modification of Token in useDetectNativeToken()
  const externalLogo = useProxyTokenLogo(currency?.chainId, currencyAddress)
  const cacheKey = `${currencyAddress}|${currency?.chainId}`
  const cached = currencyLogoCache.get(cacheKey)
  const logoURI = currency ? (currency as Currency & { logoURI: string }).logoURI : null
  const imageOverride = currency?.isToken ? ADDRESS_IMAGE_OVERRIDE[currency.address] : null

  if (cached) {
    /**
     * There can be a wrong token icon deriving if tokens in COMMON_BASES
     * Example: EURE_GNOSIS_CHAIN
     * This token doesn't have a logo in the const above, but it has it in cowprotocol/token-lists
     * However, since the token from COMMON_BASES is always used first (because it's hardcoded)
     * It gets a logo url from getTokenLogoURI() and it's invalid
     * After loading the tokens list we should update the cache if there is a logoURI and no imageOverride
     */
    if (logoURI && !cached.includes(logoURI) && !imageOverride) {
      cached.unshift(logoURI)
    }

    return cached
  }

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
