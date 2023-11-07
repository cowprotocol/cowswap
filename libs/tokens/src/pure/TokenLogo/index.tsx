import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'

import { cowprotocolTokenLogoUrl, NATIVE_CURRENCY_BUY_ADDRESS, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { Slash } from 'react-feather'
import styled from 'styled-components/macro'

import { getTokenLogoUrls } from '../../utils/getTokenLogoUrls'

const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})

const TokenLogoWrapper = styled.div<{ size?: number }>`
  display: inline-block;
  background: var(--cow-container-bg-01);
  border-radius: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  overflow: hidden;

  img {
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    border-radius: ${({ size }) => size}px;
    object-fit: contain;
  }
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
        return [cowprotocolTokenLogoUrl(NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase(), token.chainId as SupportedChainId)]
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
    <TokenLogoWrapper className={className} size={size}>
      {!currentUrl ? <Slash size={size} /> : <img alt="" src={currentUrl} onError={onError} />}
    </TokenLogoWrapper>
  )
}
