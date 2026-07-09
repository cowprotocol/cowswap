import { cowprotocolTokenLogoUrl, TokenWithLogo } from '@cowprotocol/common-const'
import { isSupportedChainId, uriToHttp } from '@cowprotocol/common-utils'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { trustTokenLogoUrl } from './trustTokenLogoUrl'

export function getTokenLogoUrls(token: TokenWithLogo | undefined): string[] {
  // for sol tokens we use address as it is, without logo.png
  const fallbackUrls =
    token?.address && isSupportedChainId(token.chainId) ? getTokenLogoFallbacks(token.address, token.chainId) : []

  if (!token?.logoURI) {
    return fallbackUrls
  }

  const urls = uriToHttp(token.logoURI)

  if (fallbackUrls.length) {
    urls.push(...fallbackUrls.filter((url) => !urls.includes(url)))
  }

  return urls
}

function getTokenLogoFallbacks(address: string, chainId: SupportedChainId): string[] {
  const addressKey = getAddressKey(address)
  const logos = [
    cowprotocolTokenLogoUrl(addressKey, chainId),
    cowprotocolTokenLogoUrl(addressKey, SupportedChainId.MAINNET),
  ]

  const trustLogo = trustTokenLogoUrl(address, chainId)

  if (trustLogo) {
    logos.push(trustLogo)
  }

  return logos
}
