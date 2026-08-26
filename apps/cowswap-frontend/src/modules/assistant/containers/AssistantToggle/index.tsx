import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useAssistantDrawer } from '../../hooks/useAssistantDrawer'
import { ChatIcon } from '../AssistantDrawer/ChatIcon'

/**
 * The whole visible change to CoW Swap when the drawer is closed: one button.
 *
 * Outlined when closed and filled when open, so its state is legible without the
 * drawer being visible — which matters on a narrow screen where the drawer covers
 * everything.
 */
const Toggle = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 13px;
  border: 1px solid var(${UI.COLOR_PRIMARY});
  border-radius: 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  background: ${({ isOpen }) => (isOpen ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PRIMARY_OPACITY_10})`)};
  color: ${({ isOpen }) => (isOpen ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_PRIMARY})`)};

  &:hover {
    background: ${({ isOpen }) => (isOpen ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PRIMARY_OPACITY_25})`)};
  }
`

export function AssistantToggle(): ReactNode {
  const { isOpen, toggle } = useAssistantDrawer()

  return (
    <Toggle isOpen={isOpen} onClick={toggle} aria-expanded={isOpen}>
      <ChatIcon size={15} />
      <Trans>Assistant</Trans>
    </Toggle>
  )
}
