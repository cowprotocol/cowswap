import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  text-align: left;
  gap: 16px;
  font-weight: 500;
`

export const TokenName = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT2});
`
