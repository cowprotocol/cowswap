import styled from 'styled-components/macro'

export const Row = styled.div`
  display: flex;
  grid-gap: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    grid-gap: 6px;
  `}
`

export const DeadlineRow = styled(Row)`
  grid-gap: 0;
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
`
