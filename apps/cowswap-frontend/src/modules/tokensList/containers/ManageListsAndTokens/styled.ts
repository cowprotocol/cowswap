import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'
export const Tab = styled.button<{ active$: boolean }>`
  color: var(${UI.COLOR_TEXT2});
  opacity: ${({ active$ }) => (active$ ? 1 : 0.5)};
  background: none;
`
