import styled from 'styled-components/macro'

export const ConfirmModalWrapper = styled.div`
  padding: 0;
  border-radius: 16px;
  background: ${({ theme }) => theme.bg1};
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`

export const ConfirmHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
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
