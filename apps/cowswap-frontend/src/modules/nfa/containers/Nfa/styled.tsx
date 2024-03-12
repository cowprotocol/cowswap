import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const NfaWrapper = styled.div`
  display: block;
  position: fixed;
  width: 380px;
  left: 200px;
  bottom: 240px;
  background-color: var(${UI.COLOR_PAPER});
  padding: 10px;
  border-radius: 10px;
`

export const NfaArrow = styled.div`
  display: block;
  color: var(${UI.COLOR_PAPER});
  position: absolute;
  left: 178px;
`

export const NfaItem = styled.div`
  display: block;
`

export const NfaPagination = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  gap: 10px;
  margin-top: 10px;
`

export const NfaPaginationItem = styled.div<{ active: boolean }>`
  background-color: ${({ active }) => (active ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  height: 8px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(${UI.COLOR_PAPER_DARKEST});
  }
`
