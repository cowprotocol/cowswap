import { cowprotocolTokenLogoUrl, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { trustTokenLogoUrl } from './trustTokenLogoUrl'

export function getTokenLogoUrls(token: TokenWithLogo | undefined): string[] {
  const fallbackUrls = token?.address ? getTokenLogoFallbacks(token.address, token.chainId as SupportedChainId) : []

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
  return [
    cowprotocolTokenLogoUrl(address.toLowerCase(), chainId),
    cowprotocolTokenLogoUrl(address.toLowerCase(), SupportedChainId.MAINNET),
    trustTokenLogoUrl(address, chainId),
  ]
}
