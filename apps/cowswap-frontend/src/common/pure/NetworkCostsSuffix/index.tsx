import React from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Wrapper = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 12px;
  margin-left: 4px;
`

export function NetworkCostsSuffix() {
  return <Wrapper> + gas</Wrapper>
}
