import React from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Wrapper = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 12px;
  margin-left: 4px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NetworkCostsSuffix() {
  return <Wrapper> + gas</Wrapper>
}
