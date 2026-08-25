import styled from 'styled-components/macro'

import { MODAL_DEBUG } from './Modal.constants'

import { UI } from '../../enum'

export const ModalContent = styled.div<{ $noPadding?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '0 10px 10px')};
  background: ${MODAL_DEBUG ? 'pink' : 'transparent'};
`

export const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 1;
  flex-shrink: 0;
  width: 100%;
  background: ${MODAL_DEBUG ? 'cyan' : `var(${UI.COLOR_PAPER})`};
`
