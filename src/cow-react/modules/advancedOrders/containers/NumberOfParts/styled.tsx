import styled from 'styled-components/macro'
import Input from 'components/NumericalInput'

export const NumericalInput = styled(Input)`
  height: 100%;
  display: flex;
  align-items: center;
  background: none;
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  flex: 1;
  width: 100%;
  max-width: 70px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
  `}
`
