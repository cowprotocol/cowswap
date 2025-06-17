import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import unknownTokenImg from 'assets/img/unknown-token.png'
import { getImageUrl, RequireContextMock, safeTokenName } from 'utils'

import { Wrapper } from './styled'

import { useTokenList } from '../../../hooks/useTokenList'

function _loadFallbackTokenImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget
  image.src = unknownTokenImg
}

export interface Props {
  network: SupportedChainId
  symbol?: string
  name?: string
  address: string
  addressMainnet?: string
  faded?: boolean
}

const tokensIconsRequire =
  process.env.NODE_ENV === 'test'
    ? RequireContextMock
    : import.meta.glob('../../../assets/img/tokens/*.png', { eager: true })

const TOKEN_ICON_FILENAME_REGEX = /(0x\w{40}|eth|xdai|avax|pol)/

const tokensIconsFilesByAddress: Record<string, string> = Object.keys(tokensIconsRequire).reduce((acc, file) => {
  const address = TOKEN_ICON_FILENAME_REGEX.exec(file)?.[0]
  if (!address) {
    throw new Error(
      "Error initializing 'assets/img/tokens' images. The image doesn't have the expected format: " + file,
    )
  }
  acc[address.toLowerCase()] = file

  return acc
}, {})

export const TokenImg: React.FC<Props> = (props) => {
  const { address, addressMainnet, symbol, name, network } = props
  const { data: tokenListTokens } = useTokenList(network)

  let iconFile = tokensIconsFilesByAddress[address.toLowerCase()]
  if (!iconFile && addressMainnet) {
    iconFile = tokensIconsFilesByAddress[addressMainnet.toLowerCase()]
  }

  const iconFileUrl: string | undefined = iconFile
    ? tokensIconsRequire[iconFile].default
    : tokenListTokens[address.toLowerCase()]?.logoURI || getImageUrl(addressMainnet || address)

  // TODO: Simplify safeTokenName signature, it doesn't need the addressMainnet or id!
  // https://github.com/gnosis/gp-v1-ui/issues/1442
  const safeName = safeTokenName({ address, symbol, name })

  return <Wrapper alt={safeName} src={iconFileUrl} onError={_loadFallbackTokenImage} {...props} />
}

export default TokenImg
