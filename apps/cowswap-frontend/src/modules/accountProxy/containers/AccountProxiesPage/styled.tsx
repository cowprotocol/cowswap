import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0 0;
  min-height: 260px;
`

export const Title = styled.span.attrs({ role: 'heading', 'aria-level': 3 })`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-weight: 500;
  font-size: 15px;
  text-align: center;
  padding: 0 10px;
  margin: 12px auto 32px;
`
