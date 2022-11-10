import styled from 'styled-components/macro'

export const ConfirmModalWrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.bg1};
`

export const ConfirmHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

export const ConfirmHeaderTitle = styled.h3`
  margin: 0;
`
