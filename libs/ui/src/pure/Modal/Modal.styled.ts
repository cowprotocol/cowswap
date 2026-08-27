import styled from 'styled-components/macro'

import { MODAL_DEBUG } from './Modal.constants'

export const ModalContent = styled.div<{ $noPadding?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '0 10px 10px')};
  background: ${MODAL_DEBUG ? 'pink' : 'transparent'};
`
