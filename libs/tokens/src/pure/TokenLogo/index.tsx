import { atom, useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { cowprotocolTokenLogoUrl, LpToken, NATIVE_CURRENCY_ADDRESS, TokenWithLogo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media, UI } from '@cowprotocol/ui'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { Slash } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { SingleLetterLogo } from './SingleLetterLogo'

import { useTokensByAddressMap } from '../../hooks/tokens/useTokensByAddressMap'
import { getTokenLogoUrls } from '../../utils/getTokenLogoUrls'

const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})
const defaultSize = 42

export const TokenLogoWrapper = styled.div<{ size?: number; sizeMobile?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(${UI.COLOR_DARK_IMAGE_PAPER});
  color: var(${UI.COLOR_DARK_IMAGE_PAPER_TEXT});
  border-radius: ${({ size = defaultSize }) => size}px;
  width: ${({ size = defaultSize }) => size}px;
  height: ${({ size = defaultSize }) => size}px;
  min-width: ${({ size = defaultSize }) => size}px;
  min-height: ${({ size = defaultSize }) => size}px;
  font-size: ${({ size = defaultSize }) => size}px;
  overflow: hidden;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: ${({ size }) => size ?? defaultSize}px;
    object-fit: contain;
  }

  ${Media.upToSmall()} {
    ${({ sizeMobile }) =>
      sizeMobile
        ? css`
            border-radius: ${sizeMobile}px;
            width: ${sizeMobile}px;
            height: ${sizeMobile}px;
            min-width: ${sizeMobile}px;
            min-height: ${sizeMobile}px;
            font-size: ${sizeMobile}px;

            > img,
            > svg {
              border-radius: ${sizeMobile}px;
            }
          `
        : ''}
  }
`

const LpTokenWrapper = styled.div<{ size?: number }>`
  width: 100%;
  height: 100%;
  position: relative;

  > div {
    width: 50%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }

  > div:last-child {
    right: -1px;
  }

  > div:last-child > img,
  > div:last-child > svg {
    right: 100%;
    position: relative;
  }

  > div > img,
  > div > svg {
    width: ${({ size = defaultSize }) => size}px;
    height: ${({ size = defaultSize }) => size}px;
    min-width: ${({ size = defaultSize }) => size}px;
    min-height: ${({ size = defaultSize }) => size}px;
  }
`

export interface TokenLogoProps {
  token?: TokenWithLogo | LpToken | Currency | null
  logoURI?: string
  className?: string
  size?: number
  sizeMobile?: number
  noWrap?: boolean
}

export function TokenLogo({ logoURI, token, className, size = 36, sizeMobile, noWrap }: TokenLogoProps) {
  const tokensByAddress = useTokensByAddressMap()

  const [invalidUrls, setInvalidUrls] = useAtom(invalidUrlsAtom)
  const isLpToken = token instanceof LpToken

  const urls = useMemo(() => {
    if (token instanceof LpToken) return

    // TODO: get rid of Currency usage and remove type casting
    if (token) {
      if (token instanceof NativeCurrency) {
        return [cowprotocolTokenLogoUrl(NATIVE_CURRENCY_ADDRESS.toLowerCase(), token.chainId as SupportedChainId)]
      }

      return getTokenLogoUrls(token as TokenWithLogo)
    }

    return logoURI ? uriToHttp(logoURI) : []
  }, [logoURI, token])

  const validUrls = useMemo(() => urls && urls.filter((url) => !invalidUrls[url]), [urls, invalidUrls])

  const currentUrl = validUrls?.[0]

  const onError = useCallback(() => {
    if (!currentUrl) return

    setInvalidUrls((state) => ({ ...state, [currentUrl]: true }))
  }, [currentUrl, setInvalidUrls])

  const initial = token?.symbol?.[0] || token?.name?.[0]

  if (isLpToken) {
    return (
      <TokenLogoWrapper className={className} size={size} sizeMobile={sizeMobile}>
        <LpTokenWrapper size={size}>
          <div>
            <TokenLogo noWrap token={tokensByAddress[token.tokens?.[0]]} size={size} sizeMobile={sizeMobile} />
          </div>
          <div>
            <TokenLogo noWrap token={tokensByAddress[token.tokens?.[1]]} size={size} sizeMobile={sizeMobile} />
          </div>
        </LpTokenWrapper>
      </TokenLogoWrapper>
    )
  }

  const content = currentUrl ? (
    <img alt="token logo" src={currentUrl} onError={onError} />
  ) : initial ? (
    <SingleLetterLogo initial={initial} />
  ) : (
    <Slash />
  )

  if (noWrap) return content

  return (
    <TokenLogoWrapper className={className} size={size} sizeMobile={sizeMobile}>
      {content}
    </TokenLogoWrapper>
  )
}
