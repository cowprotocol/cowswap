import HeaderMod, { UniIcon } from './HeaderMod'
import styled from 'styled-components'

export const Header = styled(HeaderMod)`
  border-bottom: 1px solid ${({ theme }) => theme.border};

  ${UniIcon} {
    display: flex;
  }
`

export default Header
