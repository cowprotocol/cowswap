import { cowprotocolTokenUrl, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getTokenLogoUrls(token: TokenWithLogo | undefined): string[] {
  const fallbackUrls = token?.address
    ? [
        cowprotocolTokenUrl(token.address, token.chainId as SupportedChainId),
        cowprotocolTokenUrl(token.address.toLowerCase(), token.chainId as SupportedChainId),
        cowprotocolTokenUrl(token.address.toLowerCase(), SupportedChainId.MAINNET),
      ]
    : []

  if (!token?.logoURI) {
    return fallbackUrls
  }

  const urls = uriToHttp(token.logoURI)

  if (fallbackUrls.length) {
    urls.push(...fallbackUrls.filter((url) => !urls.includes(url)))
  }

  return urls
}
