import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'

import { cowprotocolTokenLogoUrl, NATIVE_CURRENCY_ADDRESS, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { Slash } from 'react-feather'
import styled, { css } from 'styled-components/macro'



import { SingleLetterLogo } from './SingleLetterLogo'

import { getTokenLogoUrls } from '../../utils/getTokenLogoUrls'

const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})

export const TokenLogoWrapper = styled.div<{ size?: number; sizeMobile?: number }>`
  display: inline-block;
  background: var(${UI.COLOR_DARK_IMAGE_PAPER});
  color: var(${UI.COLOR_DARK_IMAGE_PAPER_TEXT});
  border-radius: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  overflow: hidden;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: ${({ size }) => size}px;
    object-fit: contain;
  }

  ${({ theme, sizeMobile }) => theme.mediaWidth.upToSmall`
    ${
      sizeMobile
        ? css`
            border-radius: ${sizeMobile}px;
            width: ${sizeMobile}px;
            height: ${sizeMobile}px;

            > img,
            > svg {
              border-radius: ${sizeMobile}px;
            }
          `
        : ''
    }
  `}
`

export interface TokenLogoProps {
  token?: TokenWithLogo | Currency | null
  logoURI?: string
  className?: string
  size?: number
  sizeMobile?: number
}

export function TokenLogo({ logoURI, token, className, size = 36, sizeMobile }: TokenLogoProps) {
  const [invalidUrls, setInvalidUrls] = useAtom(invalidUrlsAtom)

  const urls = useMemo(() => {
    // TODO: get rid of Currency usage and remove type casting
    if (token) {
      if (token instanceof NativeCurrency) {
        return [cowprotocolTokenLogoUrl(NATIVE_CURRENCY_ADDRESS.toLowerCase(), token.chainId as SupportedChainId)]
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

  const initial = token?.symbol?.[0] || token?.name?.[0]

  return (
    <TokenLogoWrapper className={className} size={size} sizeMobile={sizeMobile}>
      {currentUrl ? (
        <img alt="token logo" src={currentUrl} onError={onError} />
      ) : initial ? (
        <SingleLetterLogo initial={initial} />
      ) : (
        <Slash />
      )}
    </TokenLogoWrapper>
  )
}
