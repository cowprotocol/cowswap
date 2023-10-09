import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'

import { cowprotocolTokenUrl, NATIVE_CURRENCY_BUY_ADDRESS, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { Slash } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { getTokenLogoUrls } from '../../utils/getTokenLogoUrls'

const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})

const TokenLogoWrapper = styled.div`
  display: inline-block;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 50%;
`

export interface TokenLogoProps {
  token?: TokenWithLogo | Currency | null
  logoURI?: string
  className?: string
  size?: number
}

export function TokenLogo({ logoURI, token, className, size = 36 }: TokenLogoProps) {
  const [invalidUrls, setInvalidUrls] = useAtom(invalidUrlsAtom)

  const urls = useMemo(() => {
    // TODO: get rid of Currency usage and remove type casting
    if (token) {
      if (token instanceof NativeCurrency) {
        return [cowprotocolTokenUrl(NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase(), token.chainId as SupportedChainId)]
      }

      return getTokenLogoUrls(token as TokenWithLogo)
    }

    return logoURI ? uriToHttp(logoURI) : []
  }, [logoURI, token])

  const validUrls = useMemo(() => urls.filter((url) => !invalidUrls[url]), [urls, invalidUrls])

  const currentUrl = validUrls[0]

  const onError = () => {
    setInvalidUrls((state) => ({ ...state, [currentUrl]: true }))
  }

  return (
    <TokenLogoWrapper className={className} style={{ width: size, height: size }}>
      {!currentUrl ? (
        <Slash size={size} />
      ) : (
        <img alt="" src={currentUrl} onError={onError} width={size} height={size} />
      )}
    </TokenLogoWrapper>
  )
}
