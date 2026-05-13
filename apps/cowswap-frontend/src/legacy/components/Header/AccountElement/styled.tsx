import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  background: ${({ active }) => (active ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PAPER})`)};
  border-radius: 28px;
  border: none;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: auto;
  width: auto;
  height: 100%;

  ${Media.upToMedium()} {
    height: 100%;
  }

  ${({ theme }) =>
    theme.isWidget &&
    `
    background-color: transparent;
    margin: 0 20px 0 auto!important;
    border: 0!important;
  `}
`
