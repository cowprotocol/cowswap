import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TableBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  border: none;
  padding: 0;
  position: relative;
  background: var(${UI.COLOR_PAPER});
  width: 100%;
`

export const TableInner = styled.div`
  display: block;
  width: inherit;
  height: inherit;
  padding: 0;
  overflow-y: hidden;
  overflow-x: auto;
  ${({ theme }) => theme.colorScrollbar};
`

export const HeaderElement = styled.div<{ doubleRow?: boolean }>`
  height: 100%;
  padding: 0;
  font-size: 12px;
  line-height: 1.1;
  font-weight: 500;
  display: flex;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.7;
    }
  `}
`

export const Rows = styled.div`
  display: block;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToLargeAlt()} {
    display: flex;
    flex-flow: column wrap;
  }
`
