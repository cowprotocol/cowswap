import { atom, useAtom } from 'jotai'
import { type ReactNode, useCallback } from 'react'

import { cowprotocolTokenLogoUrl } from '@cowprotocol/common-const/tokens'
import { getAddressKey, isSupportedChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import Image from 'next/image'

import styles from './TokenLogo.module.css'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { useIsDarkTheme } from '@/shared/lib/theme'

const LOGO_SIZES = { small: 20, regular: 32, large: 40, hero: 56 } as const
const CHAIN_BADGE_SIZE = 16

const failedLogoUrlsAtom = atom<Record<string, true>>({})

interface TokenLogoProps {
  symbol: string
  logoUrl: string | null | undefined
  /** Shows a network badge */
  chainId?: number
  /** Adds the CoW token list logos of this token, on its network and on Ethereum, after `logoUrl` */
  token?: { chainId: number; address: string }
  size?: keyof typeof LOGO_SIZES
}

/** Shows the first of the logo URLs that loads, as CoW Swap does, and the first letter of `symbol` if none does */
export function TokenLogo({ symbol, logoUrl, chainId, token, size = 'regular' }: TokenLogoProps): ReactNode {
  const isDark = useIsDarkTheme()
  const [failedUrls, setFailedUrls] = useAtom(failedLogoUrlsAtom)
  const currentUrl = getLogoUrls(logoUrl, token).find((url) => !failedUrls[url])
  const chainLogoUrl = chainId === undefined ? null : getChainLogoUrl(chainId, isDark)
  const pixels = LOGO_SIZES[size]

  const onError = useCallback(() => {
    if (currentUrl) setFailedUrls((urls) => ({ ...urls, [currentUrl]: true }))
  }, [currentUrl, setFailedUrls])

  return (
    <span
      className={chainLogoUrl ? `${styles.wrapper} ${styles.withBadge}` : styles.wrapper}
      style={{ width: pixels, height: pixels }}
    >
      {currentUrl ? (
        <Image
          key={currentUrl}
          className={styles.logo}
          src={currentUrl}
          alt=""
          width={pixels}
          height={pixels}
          unoptimized
          onError={onError}
        />
      ) : (
        <span className={styles.placeholder}>{symbol.charAt(0)}</span>
      )}
      {chainId !== undefined && chainLogoUrl && (
        <Image
          className={styles.chainBadge}
          src={chainLogoUrl}
          alt={getChainLabel(chainId)}
          width={CHAIN_BADGE_SIZE}
          height={CHAIN_BADGE_SIZE}
          unoptimized
        />
      )}
    </span>
  )
}

function getLogoUrls(logoUrl: string | null | undefined, token: TokenLogoProps['token']): string[] {
  const urls = logoUrl ? [logoUrl] : []

  if (token && isSupportedChain(token.chainId)) {
    const addressKey = getAddressKey(token.address)

    urls.push(
      cowprotocolTokenLogoUrl(addressKey, token.chainId),
      cowprotocolTokenLogoUrl(addressKey, SupportedChainId.MAINNET),
    )
  }

  return [...new Set(urls)]
}
