import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  min-height: 50px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;

  > span {
    flex: 1;
  }

  > button {
    width: auto;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `}
`
