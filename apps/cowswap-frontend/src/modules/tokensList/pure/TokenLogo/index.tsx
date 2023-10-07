import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'

import { cowprotocolTokenUrl, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Slash } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})

const TokenLogoWrapper = styled.div`
  display: inline-block;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 50%;
`

export interface TokenLogoProps {
  token?: TokenWithLogo
  logoURI?: string
  className?: string
  size?: number
}

export function TokenLogo({ logoURI: _logoURI, token, className, size = 36 }: TokenLogoProps) {
  const [invalidUrls, setInvalidUrls] = useAtom(invalidUrlsAtom)

  const logoURI = _logoURI || token?.logoURI

  const urls = useMemo(() => {
    // TODO: all images should be stored in the same format (lowercase)
    const fallbackUrls = token
      ? [
          cowprotocolTokenUrl(token.address, token.chainId as SupportedChainId),
          cowprotocolTokenUrl(token.address.toLowerCase(), token.chainId as SupportedChainId),
        ]
      : []

    if (!logoURI) {
      return fallbackUrls
    }

    const urls = uriToHttp(logoURI)

    if (fallbackUrls.length) {
      urls.push(...fallbackUrls.filter((url) => !urls.includes(url)))
    }

    return urls
  }, [logoURI, token])

  const validUrls = useMemo(() => urls.filter((url) => !invalidUrls[url]), [urls, invalidUrls])

  const currentUrl = validUrls[0]

  const onError = () => {
    setInvalidUrls((state) => ({ ...state, [currentUrl]: true }))
  }

  return (
    <TokenLogoWrapper className={className} style={{ width: size, height: size }}>
      {!currentUrl ? <Slash size={size} /> : <img src={currentUrl} onError={onError} width={size} height={size} />}
    </TokenLogoWrapper>
  )
}
