import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'

import { uriToHttp } from '@cowprotocol/common-utils'

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
  logoURI: string | undefined
  className?: string
  size?: number
}

export function TokenLogo({ logoURI, className, size = 36 }: TokenLogoProps) {
  const [invalidUrls, setInvalidUrls] = useAtom(invalidUrlsAtom)

  const urls = useMemo(
    () => (logoURI ? uriToHttp(logoURI).filter((url) => !invalidUrls[url]) : []),
    [logoURI, invalidUrls]
  )

  const currentUrl = urls[0]

  const onError = () => setInvalidUrls({ ...invalidUrls, [currentUrl]: true })

  return (
    <TokenLogoWrapper className={className} style={{ width: size, height: size }}>
      {!currentUrl ? <Slash size={size} /> : <img src={currentUrl} onError={onError} width={size} height={size} />}
    </TokenLogoWrapper>
  )
}
