import styled from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

export const Suffix = styled.span`
  margin-left: 5px;
`
export const NumericalInput = styled(Input)<{ color?: string }>`
  color: ${({ theme, color }) => {
    if (color === 'red') return theme.red1
    if (color === 'yellow') return theme.yellow2
    return theme.text1
  }};
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
