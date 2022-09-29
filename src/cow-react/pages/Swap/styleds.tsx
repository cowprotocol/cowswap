import styled from 'styled-components/macro'
import { Info } from 'react-feather'

export const StyledInfo = styled(Info)`
  opacity: 0.4;
  color: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;

  &:hover {
    opacity: 0.8;
  }
`

export const AlertWrapper = styled.div`
  max-width: 460px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 26px auto 0;
    padding: 0 16px;
  `}
`
