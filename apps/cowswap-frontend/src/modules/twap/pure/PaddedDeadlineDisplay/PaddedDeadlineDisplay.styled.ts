import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  column-gap: 0.35em;
  font-variant-numeric: tabular-nums;
`

export const Part = styled.span<{ $significant: boolean }>`
  font-weight: ${({ $significant }) =>
    $significant ? `var(${UI.FONT_WEIGHT_BOLD})` : `var(${UI.FONT_WEIGHT_MEDIUM})`};
`
