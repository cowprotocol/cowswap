import React from 'react'
import styled from 'styled-components'

import { getImageUrl, RequireContextMock, safeTokenName } from 'utils'
import unknownTokenImg from 'assets/img/unknown-token.png'

const Wrapper = styled.img<WrapperProps>`
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 3.6rem;
  object-fit: contain;
  background-color: white;
  opacity: ${(props): number => (props.faded ? 0.4 : 1)};
`

function _loadFallbackTokenImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget
  image.src = unknownTokenImg
}

export interface Props {
  symbol?: string
  name?: string
  address: string
  addressMainnet?: string
  faded?: boolean
}

export interface WrapperProps {
  faded?: boolean
}

const tokensIconsRequire =
  process.env.NODE_ENV === 'test' ? RequireContextMock : require.context('assets/img/tokens', false)

const TOKEN_ICON_FILENAME_REGEX = /(0x\w{40}|eth|xdai)/

const tokensIconsFilesByAddress: Record<string, string> = tokensIconsRequire.keys().reduce((acc, file) => {
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
  const { address, addressMainnet, symbol, name } = props

  let iconFile = tokensIconsFilesByAddress[address.toLowerCase()]
  if (!iconFile && addressMainnet) {
    iconFile = tokensIconsFilesByAddress[addressMainnet.toLowerCase()]
  }

  const iconFileUrl: string | undefined = iconFile
    ? tokensIconsRequire(iconFile).default
    : getImageUrl(addressMainnet || address)

  // TODO: Simplify safeTokenName signature, it doesn't need the addressMainnet or id!
  // https://github.com/gnosis/gp-v1-ui/issues/1442
  const safeName = safeTokenName({ address, symbol, name })

  return <Wrapper alt={safeName} src={iconFileUrl} onError={_loadFallbackTokenImage} {...props} />
}

export const TokenImgWrapper = styled(TokenImg)`
  margin: 0 1rem 0 0;
`

export default TokenImg
