import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Totals = styled.span`
  text-align: right;
`

// Full-width line under the label and totals: the receipt field is a wrapping flex row.
export const Details = styled.details`
  flex: 1 1 100%;
  margin: 4px 0 0;

  > summary {
    cursor: pointer;
    text-align: right;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const Table = styled.table`
  width: 100%;
  margin: 8px 0 0;
  border-collapse: collapse;

  td {
    padding: 6px 0;
    border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }

  td:first-child {
    padding-right: 16px;
    text-align: left;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }

  td:last-child {
    text-align: right;
    white-space: nowrap;
  }
`

export const Approximate = styled.span`
  display: inline-block;
  cursor: help;
  text-decoration: underline dotted;
`
