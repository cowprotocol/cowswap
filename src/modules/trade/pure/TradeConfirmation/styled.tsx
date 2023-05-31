import styled from 'styled-components/macro'

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: ${({ withRecipient }) => (withRecipient ? '0 10px' : '0')};
`

export const ConfirmWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  padding: 0 10px 16px;
`
