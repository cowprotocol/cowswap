import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const InfoTableWrapper = styled.div`
  margin: 32px auto 16px;
  font-size: 14px;
  padding: 0 10px;

  ${Media.upToSmall()} {
    padding: 0 20px;
    overflow-x: auto;
  }

  h3 {
    margin: 0;
  }
`

export const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }

  tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 10px 0;
    vertical-align: top;
  }

  td:first-child {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    white-space: nowrap;
    padding-right: 10px;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`
