import HeaderMod, { UniIcon, NetworkCard } from './HeaderMod'
import styled from 'styled-components'
export { NETWORK_LABELS } from './HeaderMod'

export const Header = styled(HeaderMod)`
  border-bottom: ${({ theme }) => theme.header.border};

  ${UniIcon} {
    display: flex;
  }

  ${NetworkCard} {
    background: ${({ theme }) => theme.networkCard.background};
    color: ${({ theme }) => theme.networkCard.text};
  }
`

export const LogoImage = styled.img.attrs(props => ({
  src: props.theme.logo.src,
  alt: props.theme.logo.alt,
  width: props.theme.logo.width,
  height: props.theme.logo.height
}))`
  object-fit: contain;
`

export default Header
