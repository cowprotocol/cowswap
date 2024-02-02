import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  text-align: left;
  gap: 16px;
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 10px;
    flex: 1 1 auto;
  `}
`

export const TokenName = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: inherit;
  opacity: 0.6;
`
