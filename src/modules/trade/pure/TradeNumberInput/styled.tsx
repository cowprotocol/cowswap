import styled from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

export const Suffix = styled.span`
  margin: 0 0 0 3px;
  opacity: 0.7;
  font-weight: 600;
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
  width: auto;
  height: 100%;
  font-size: 22px;
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
  `}
`
