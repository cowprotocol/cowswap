import styled from 'styled-components/macro'

export const WidgetWrapper = styled.div`
  width: 100%;
  padding: 0;
  border-radius: 16px;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: ${({ withRecipient }) => (withRecipient ? '0 10px' : '0')};
`

export const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  padding: 0 10px 16px;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 20;
  margin: 0;
`

export const ConfirmHeaderTitle = styled.h3`
  margin: 0;
  font-size: 18px;
`
