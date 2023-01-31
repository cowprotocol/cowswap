import styled from 'styled-components/macro'

export const Box = styled.div`
  > div {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 5px;

    > :last-child {
      text-align: right;
      margin-bottom: 0;
    }
  }
`

export const GreenText = styled.span`
  color: ${({ theme }) => theme.green1};
`

export const TotalAmount = styled.div`
  border-top: 1px solid #9191912e;
  font-weight: bold;
  margin-top: 8px;
  padding-top: 8px;

  > span:first-child {
    white-space: nowrap;
  }
`
