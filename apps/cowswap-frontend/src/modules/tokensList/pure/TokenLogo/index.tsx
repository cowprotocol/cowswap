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
    const fallbackUrl = token ? cowprotocolTokenUrl(token.address, token.chainId as SupportedChainId) : null

    if (!logoURI) {
      return fallbackUrl ? [fallbackUrl] : []
    }

    return uriToHttp(logoURI)
      .filter((url) => !invalidUrls[url])
      .concat(fallbackUrl || [])
  }, [logoURI, token, invalidUrls])

  const currentUrl = urls[0]

  const onError = () => setInvalidUrls({ ...invalidUrls, [currentUrl]: true })

  return (
    <TokenLogoWrapper className={className} style={{ width: size, height: size }}>
      {!currentUrl ? <Slash size={size} /> : <img src={currentUrl} onError={onError} width={size} height={size} />}
    </TokenLogoWrapper>
  )
}
