import { atom, useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  BaseChainInfo,
  cowprotocolTokenLogoUrl,
  LpToken,
  NATIVE_CURRENCY_ADDRESS,
  TokenWithLogo,
} from '@cowprotocol/common-const'
import { getChainInfo } from '@cowprotocol/common-const'
import { uriToHttp } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media, UI } from '@cowprotocol/ui'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { Slash } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { SingleLetterLogo } from './SingleLetterLogo'

import { useNetworkLogo } from '../../hooks/tokens/useNetworkLogo'
import { useTokensByAddressMap } from '../../hooks/tokens/useTokensByAddressMap'
import { getTokenLogoUrls } from '../../utils/getTokenLogoUrls'

const BORDER_WIDTH_MIN = 1.5
const BORDER_WIDTH_MAX = 2.2
const BORDER_WIDTH_RATIO = 0.15
const DEFAULT_SIZE = 42
const DEFAULT_CHAIN_LOGO_SIZE = 16

const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})

const getBorderWidth = (size: number): number =>
  Math.max(BORDER_WIDTH_MIN, Math.min(BORDER_WIDTH_MAX, size * BORDER_WIDTH_RATIO))

export const TokenLogoWrapper = styled.div<{ size?: number; sizeMobile?: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(${UI.COLOR_DARK_IMAGE_PAPER});
  color: var(${UI.COLOR_DARK_IMAGE_PAPER_TEXT});
  border-radius: ${({ size = DEFAULT_SIZE }) => size}px;
  width: ${({ size = DEFAULT_SIZE }) => size}px;
  height: ${({ size = DEFAULT_SIZE }) => size}px;
  min-width: ${({ size = DEFAULT_SIZE }) => size}px;
  min-height: ${({ size = DEFAULT_SIZE }) => size}px;
  font-size: ${({ size = DEFAULT_SIZE }) => size}px;
  overflow: revert;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: ${({ size }) => size ?? DEFAULT_SIZE}px;
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

const ChainLogoWrapper = styled.div<{ size?: number; sizeMobile?: number }>`
  ${({ size = DEFAULT_CHAIN_LOGO_SIZE }) => {
    const borderWidth = getBorderWidth(size)
    return `
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(${UI.COLOR_DARK_IMAGE_PAPER});
      border: ${borderWidth}px solid var(${UI.COLOR_PAPER});
      position: absolute;
      padding: 0;
      bottom: -${borderWidth}px;
      right: -${borderWidth}px;
    `
  }}

  ${Media.upToSmall()} {
    ${({ sizeMobile }) =>
      sizeMobile
        ? css`
            width: ${sizeMobile}px;
            height: ${sizeMobile}px;
          `
        : ''}
  }

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
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
    width: ${({ size = DEFAULT_SIZE }) => size}px;
    height: ${({ size = DEFAULT_SIZE }) => size}px;
    min-width: ${({ size = DEFAULT_SIZE }) => size}px;
    min-height: ${({ size = DEFAULT_SIZE }) => size}px;
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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
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

  const logoUrl = useNetworkLogo(token?.chainId)

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

  const tokenContent = currentUrl ? (
    <img
      alt={`${token?.symbol || ''} ${token?.name ? `(${token?.name})` : ''} token logo`}
      src={currentUrl}
      onError={onError}
    />
  ) : initial ? (
    <SingleLetterLogo initial={initial} />
  ) : (
    <Slash />
  )

  if (noWrap) return tokenContent

  const chainInfo: BaseChainInfo | undefined = getChainInfo(token?.chainId as SupportedChainId)
  const chainName = chainInfo?.label || ''

  return (
    <TokenLogoWrapper className={className} size={size} sizeMobile={sizeMobile}>
      {tokenContent}
      {logoUrl && (
        <ChainLogoWrapper size={size / 1.85} sizeMobile={sizeMobile ? sizeMobile / 1.85 : undefined}>
          <img src={logoUrl} alt={`${chainName} network logo`} />
        </ChainLogoWrapper>
      )}
    </TokenLogoWrapper>
  )
}
