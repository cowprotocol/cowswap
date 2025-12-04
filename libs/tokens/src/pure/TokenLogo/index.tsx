import { atom, useAtom } from 'jotai'
import { ReactNode, useCallback, useMemo } from 'react'

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
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { Slash } from 'react-feather'

import { SingleLetterLogo } from './SingleLetterLogo'
import * as Styled from './styled'

import { useNetworkLogo } from '../../hooks/tokens/useNetworkLogo'
import { useTokensByAddressMap } from '../../hooks/tokens/useTokensByAddressMap'
import { getTokenLogoUrls } from '../../utils/getTokenLogoUrls'

export { TokenLogoWrapper, TokenImageWrapper } from './styled'

const BORDER_WIDTH_MIN = 1.8
const BORDER_WIDTH_MAX = 2.5
const BORDER_WIDTH_RATIO = 0.15
const invalidUrlsAtom = atom<{ [url: string]: boolean }>({})
const getBorderWidth = (size: number): number =>
  Math.max(BORDER_WIDTH_MIN, Math.min(BORDER_WIDTH_MAX, size * BORDER_WIDTH_RATIO))

export interface TokenLogoProps {
  token?: TokenWithLogo | LpToken | Currency | null
  logoURI?: string
  className?: string
  size?: number
  sizeMobile?: number
  noWrap?: boolean
  hideNetworkBadge?: boolean
}

export function TokenLogo(props: TokenLogoProps): ReactNode {
  const { token } = props

  if (token instanceof LpToken) {
    return <LpTokenLogo {...props} token={token} />
  }

  return <StandardTokenLogo {...props} />
}

type StandardTokenLogoProps = TokenLogoProps & { token?: TokenWithLogo | Currency | null }

function StandardTokenLogo({
  logoURI,
  token,
  className,
  size = 36,
  sizeMobile,
  noWrap,
  hideNetworkBadge,
}: StandardTokenLogoProps): ReactNode {
  const [invalidUrls, setInvalidUrls] = useAtom(invalidUrlsAtom)

  const { currentUrl, initial } = useTokenLogoUrl({ token, logoURI, invalidUrls })

  const networkLogoUrl = useNetworkLogo(token?.chainId)
  const showNetworkBadge = networkLogoUrl && !hideNetworkBadge

  const onError = useCallback(() => {
    if (!currentUrl) return

    setInvalidUrls((state) => ({ ...state, [currentUrl]: true }))
  }, [currentUrl, setInvalidUrls])

  const actualTokenContent = (
    <TokenLogoContent currentUrl={currentUrl} onError={onError} token={token} initial={initial} />
  )

  if (noWrap) {
    return actualTokenContent
  }

  const chainInfo: BaseChainInfo | undefined = getChainInfo(token?.chainId as SupportedChainId)
  const chainName = chainInfo?.label || ''

  // This is the size of the chain logo
  // 2.2 is the ratio of smaller chain logo size vs bigger token logo (makes chain logo ~45% of token logo size)
  const chainLogoSizeForCalc = size / 2.2
  // This is the thickness of the cutout around the chain logo
  const cutThicknessForCalc = getBorderWidth(chainLogoSizeForCalc)

  return (
    <Styled.TokenLogoWrapper
      className={className}
      size={size}
      sizeMobile={sizeMobile}
      $hasNetworkBadge={!!showNetworkBadge}
    >
      <>
        {showNetworkBadge ? (
          <Styled.ClippedTokenContentWrapper
            parentSize={size}
            chainLogoSize={chainLogoSizeForCalc}
            cutThickness={cutThicknessForCalc}
            hasImage={!!currentUrl}
          >
            {actualTokenContent}
          </Styled.ClippedTokenContentWrapper>
        ) : (
          actualTokenContent
        )}
        {showNetworkBadge && (
          <Styled.ChainLogoWrapper size={chainLogoSizeForCalc}>
            <img src={networkLogoUrl} alt={`${chainName} network logo`} />
          </Styled.ChainLogoWrapper>
        )}
      </>
    </Styled.TokenLogoWrapper>
  )
}

type LpTokenLogoProps = Omit<TokenLogoProps, 'token'> & { token: LpToken }

function LpTokenLogo({ token, className, size = 36, sizeMobile }: LpTokenLogoProps): ReactNode {
  const tokensByAddress = useTokensByAddressMap()

  return (
    <Styled.TokenLogoWrapper className={className} size={size} sizeMobile={sizeMobile}>
      <Styled.LpTokenWrapper size={size}>
        <div>
          <TokenLogo noWrap token={tokensByAddress[token.tokens?.[0]]} size={size} sizeMobile={sizeMobile} />
        </div>
        <div>
          <TokenLogo noWrap token={tokensByAddress[token.tokens?.[1]]} size={size} sizeMobile={sizeMobile} />
        </div>
      </Styled.LpTokenWrapper>
    </Styled.TokenLogoWrapper>
  )
}

interface TokenLogoUrlOptions {
  token?: TokenWithLogo | Currency | null
  logoURI?: string
  invalidUrls: Record<string, boolean>
}

function useTokenLogoUrl({ token, logoURI, invalidUrls }: TokenLogoUrlOptions): {
  currentUrl?: string
  initial?: string
} {
  const urls = useMemo(() => {
    if (token instanceof LpToken) {
      return []
    }

    if (token instanceof NativeCurrency) {
      return [cowprotocolTokenLogoUrl(NATIVE_CURRENCY_ADDRESS.toLowerCase(), token.chainId as SupportedChainId)]
    }

    if (token) {
      return getTokenLogoUrls(token as TokenWithLogo)
    }

    return logoURI ? uriToHttp(logoURI) : []
  }, [logoURI, token])

  const validUrls = useMemo(() => urls && urls.filter((url) => !invalidUrls[url]), [urls, invalidUrls])
  const currentUrl = validUrls?.[0]
  const initial = token?.symbol?.[0] || token?.name?.[0]

  return { currentUrl, initial }
}

interface TokenLogoContentProps {
  currentUrl?: string
  onError: () => void
  token?: TokenWithLogo | Currency | null
  initial?: string
}

function TokenLogoContent({ currentUrl, onError, token, initial }: TokenLogoContentProps): ReactNode {
  const address = token && 'address' in token ? token.address : ''

  if (currentUrl) {
    return (
      <Styled.TokenImageWrapper>
        <img
          data-address={address}
          alt={`${token?.symbol || ''} ${token?.name ? `(${token.name})` : ''} token logo`}
          src={currentUrl}
          onError={onError}
        />
      </Styled.TokenImageWrapper>
    )
  }

  if (initial) {
    return (
      <Styled.TokenImageWrapper>
        <SingleLetterLogo address={address} initial={initial} />
      </Styled.TokenImageWrapper>
    )
  }

  return (
    <Styled.TokenImageWrapper>
      <Slash />
    </Styled.TokenImageWrapper>
  )
}
