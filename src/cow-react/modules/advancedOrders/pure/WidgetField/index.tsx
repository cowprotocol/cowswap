import styled from 'styled-components/macro'

export const WidgetField = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  flex: 1;
`
