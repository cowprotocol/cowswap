import React, { SyntheticEvent } from 'react'

import { getAddressKey, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import svgUnknownSolanaTokenSrc from 'assets/img/unknown-solana-token.svg'
import imgUnknownTokenSrc from 'assets/img/unknown-token.png'
import { getImageUrl, RequireContextMock, safeTokenName } from 'utils'

import { Wrapper } from './styled'

import { useTokenList } from '../../../hooks/useTokenList'

export interface Props {
  network: SupportedChainId
  symbol?: string
  name?: string
  address: string
  addressMainnet?: string
  faded?: boolean
  tokenLogo?: string
}

function _loadFallbackTokenImage(event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string): void {
  event.currentTarget.src = fallbackSrc
}

const tokensIconsRequire =
  process.env.NODE_ENV === 'test'
    ? RequireContextMock
    : import.meta.glob('../../../assets/img/tokens/*.png', { eager: true })

const TOKEN_ICON_FILENAME_REGEX = /(0x\w{40}|eth|xdai|avax|pol|bnb|xpl)/

const tokensIconsFilesByAddress: Record<string, string> = Object.keys(tokensIconsRequire).reduce((acc, file) => {
  const address = TOKEN_ICON_FILENAME_REGEX.exec(file)?.[0]
  if (!address) {
    throw new Error(
      "Error initializing 'assets/img/tokens' images. The image doesn't have the expected format: " + file,
    )
  }
  acc[getAddressKey(address)] = file

  return acc
}, {})

export const TokenImg: React.FC<Props> = (props) => {
  const { address, addressMainnet, symbol, name, network, tokenLogo } = props
  const { data: tokenListTokens } = useTokenList(network)

  const fallbackSrc = isSolanaChain(network) ? svgUnknownSolanaTokenSrc : imgUnknownTokenSrc

  let iconFile = address && tokensIconsFilesByAddress[getAddressKey(address)]
  if (!iconFile && addressMainnet) {
    iconFile = tokensIconsFilesByAddress[getAddressKey(addressMainnet)]
  }
  const iconFileUrl: string =
    tokenLogo ||
    (iconFile
      ? tokensIconsRequire[iconFile].default
      : tokenListTokens?.[getAddressKey(address)]?.logoURI || getImageUrl(addressMainnet || address)) ||
    fallbackSrc

  // TODO: Simplify safeTokenName signature, it doesn't need the addressMainnet or id!
  // https://github.com/gnosis/gp-v1-ui/issues/1442
  const safeName = address && safeTokenName({ address, symbol, name })

  return (
    <Wrapper
      alt={safeName}
      src={iconFileUrl}
      onError={(event) => _loadFallbackTokenImage(event, fallbackSrc)}
      {...props}
    />
  )
}
