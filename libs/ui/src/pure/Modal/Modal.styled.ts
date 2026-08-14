import styled from 'styled-components/macro'

export const ModalRoot = styled.div`
  width: 100%;
  padding: 0;
  border-radius: 16px;
  overflow-y: clip;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`

export const ModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 10px 10px;
`
