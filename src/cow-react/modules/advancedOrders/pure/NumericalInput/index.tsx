import styled from 'styled-components/macro'
import Input from 'components/NumericalInput'

export const NumericalInput = styled(Input)`
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  display: flex;
  align-items: center;
  background: none;
  flex: 1;
  width: 100%;
  height: 100%;
  max-width: 70px;
  font-size: 22px;
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
  `}
`
