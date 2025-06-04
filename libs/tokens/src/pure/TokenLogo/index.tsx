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
  --size: ${({ size = DEFAULT_SIZE }) => size}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: var(--size);
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  font-size: var(--size);
  overflow: visible;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: var(--size);
    object-fit: contain;
  }

  ${Media.upToSmall()} {
    ${({ sizeMobile }) =>
      sizeMobile
        ? css`
            --sizeMobile: ${sizeMobile}px;
            border-radius: var(--sizeMobile);
            width: var(--sizeMobile);
            height: var(--sizeMobile);
            min-width: var(--sizeMobile);
            min-height: var(--sizeMobile);
            font-size: var(--sizeMobile);

            > img,
            > svg {
              border-radius: var(--sizeMobile);
            }
          `
        : ''}
  }
`

interface ClippedTokenContentWrapperProps {
  parentSize: number
  chainLogoSize: number
  cutThickness: number
  hasImage: boolean
}

const ClippedTokenContentWrapper = styled.div<ClippedTokenContentWrapperProps>`
  --parent-size: ${({ parentSize = DEFAULT_SIZE }) => parentSize}px;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: ${({ hasImage }) => (hasImage ? 'transparent' : `var(${UI.COLOR_DARK_IMAGE_PAPER})`)};
  color: ${({ hasImage }) => (hasImage ? 'inherit' : `var(${UI.COLOR_DARK_IMAGE_PAPER_TEXT})`)};
  border-radius: var(--parent-size);
  transform: translateZ(0);

  > img,
  > svg,
  > div {
    width: 100%;
    height: 100%;
    border-radius: var(--parent-size);
    object-fit: contain;
  }

  ${({ parentSize, chainLogoSize, cutThickness }) => {
    const chainLogoRadius = chainLogoSize / 2
    const chainLogoCenterX = parentSize - chainLogoRadius
    const chainLogoCenterY = parentSize - chainLogoRadius

    const innerTransparentRadius = chainLogoRadius
    const outerTransparentRadius = chainLogoRadius + cutThickness

    return css`
      mask-image: radial-gradient(
        circle at ${chainLogoCenterX}px ${chainLogoCenterY}px,
        white 0%,
        white ${innerTransparentRadius}px,
        transparent ${innerTransparentRadius}px,
        transparent ${outerTransparentRadius}px,
        white ${outerTransparentRadius}px,
        white 100%
      );
    `
  }}
`

const ChainLogoWrapper = styled.div<{ size?: number }>`
  --size: ${({ size = DEFAULT_CHAIN_LOGO_SIZE }) => size}px;
  position: absolute;
  bottom: 0;
  right: 0;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: var(--size);
    object-fit: contain;
  }
`

const LpTokenWrapper = styled.div<{ size?: number }>`
  --size: ${({ size = DEFAULT_SIZE }) => size}px;
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
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
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

  const actualTokenContent = currentUrl ? (
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

  if (noWrap) return actualTokenContent

  const chainInfo: BaseChainInfo | undefined = getChainInfo(token?.chainId as SupportedChainId)
  const chainName = chainInfo?.label || ''

  // This is the size of the chain logo
  const chainLogoSizeForCalc = size / 2
  // This is the thickness of the cutout around the chain logo
  const cutThicknessForCalc = getBorderWidth(chainLogoSizeForCalc)

  return (
    <TokenLogoWrapper className={className} size={size} sizeMobile={sizeMobile}>
      <ClippedTokenContentWrapper
        parentSize={size}
        chainLogoSize={chainLogoSizeForCalc}
        cutThickness={cutThicknessForCalc}
        hasImage={!!currentUrl}
      >
        {actualTokenContent}
      </ClippedTokenContentWrapper>
      {logoUrl && (
        <ChainLogoWrapper size={chainLogoSizeForCalc}>
          <img src={logoUrl} alt={`${chainName} network logo`} />
        </ChainLogoWrapper>
      )}
    </TokenLogoWrapper>
  )
}
