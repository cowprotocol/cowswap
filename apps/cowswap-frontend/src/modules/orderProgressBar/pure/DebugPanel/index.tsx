import { ReactNode } from 'react'

import { ContextMenu, ContextMenuButton, ContextMenuItem, ContextMenuList, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { OrderProgressBarStepName } from '../../types'

const Wrapper = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const DebugContextMenu = styled(ContextMenu)`
  [data-reach-menu-items] {
    max-height: 280px;
    overflow-y: auto;
    top: auto;
    bottom: calc(100% + 6px);
    right: 0;
    background: var(${UI.COLOR_PAPER});
  }
`

const DebugMenuButton = styled(ContextMenuButton)`
  width: auto;
  height: auto;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  color: white;
  background: rgba(255, 255, 255, 0.12);
  font: inherit;

  &:hover,
  &:active,
  &[data-reach-menu-button][data-state='open'] {
    color: white;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
  }
`

interface DebugPanelProps {
  stepName: OrderProgressBarStepName
  setDebugStep: (stepName: OrderProgressBarStepName) => void
}

export function DebugPanel({ stepName, setDebugStep }: DebugPanelProps): ReactNode {
  return (
    <Wrapper>
      <span>{t`Debug Step:`}</span>
      <DebugContextMenu>
        <DebugMenuButton aria-label={t`Select debug step`}>
          {stepName} <ChevronDown size={16} />
        </DebugMenuButton>
        <ContextMenuList>
          {Object.values(OrderProgressBarStepName).map((step) => (
            <ContextMenuItem key={step} onSelect={() => setDebugStep(step)}>
              {step}
            </ContextMenuItem>
          ))}
        </ContextMenuList>
      </DebugContextMenu>
    </Wrapper>
  )
}
