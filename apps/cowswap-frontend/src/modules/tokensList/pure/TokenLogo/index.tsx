import { atom, useAtom } from 'jotai'

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

  const hasError = invalidUrls[logoURI!]

  const onError = () => setInvalidUrls({ ...invalidUrls, [logoURI!]: true })

  return (
    <TokenLogoWrapper className={className} style={{ width: size, height: size }}>
      {hasError || !logoURI ? (
        <Slash size={size} />
      ) : (
        <img src={logoURI} onError={onError} width={size} height={size} alt="Token logo" />
      )}
    </TokenLogoWrapper>
  )
}
