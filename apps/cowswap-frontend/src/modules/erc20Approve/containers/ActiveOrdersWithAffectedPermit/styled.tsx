import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DropdownWrapper = styled.div`
  border-radius: 14px;
  padding: 9px 6px;
  background: var(${UI.COLOR_INFO_BG});

  .font-bold {
    font-weight: 600;
  }
`

export const ArrowWrapper = styled.div`
  cursor: pointer;
  margin-left: auto;
  font-size: 6px;
`

export const DropdownHeader = styled.div<{ isOpened?: boolean }>`
  color: var(${UI.COLOR_INFO_TEXT});
  cursor: ${({ isOpened }) => (isOpened ? 'default' : 'pointer')};
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
`

export const DropdownList = styled.div`
  margin-top: 20px;
`

export const DropdownFooter = styled.div`
  font-size: 13px;
  padding: 15px 0;
  color: var(${UI.COLOR_INFO_TEXT});
`
