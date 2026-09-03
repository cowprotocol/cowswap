import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

// display: contents keeps this a valid DOM node for the #orders-table locator without pulling its
// children out of the parent Wrapper's flex layout (they'd otherwise lose the flex `gap` spacing).
export const TableWrapper = styled.div`
  display: contents;
`

export const TableBox = styled.div`
  display: flex;
  flex-flow: column nowrap;
  border: none;
  padding: 0;
  position: relative;
  background: var(${UI.COLOR_PAPER});
  // flex: 1 1 auto;
  width: 100%;
  min-height: 0;
`

export const TableInner = styled.div`
  display: block;
  width: inherit;
  height: auto;
  padding: 0;
  overflow-x: auto;
  overflow-y: visible;
  ${({ theme }) => theme.colorScrollbar};
`

export const Rows = styled.div`
  display: block;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToLargeAlt()} {
    display: flex;
    flex-flow: column wrap;
  }
`
