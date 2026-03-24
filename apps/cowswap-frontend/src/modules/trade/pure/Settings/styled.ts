import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

/** Panel for limit/TWAP settings inside SmartModal/Dropdown — flow layout (not Reach Menu positioning). */
export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 10px;
  min-width: 280px;
  max-width: calc(100vw - 32px);
`

export const SettingsButton = styled.button.attrs({ type: 'button' })`
  --maxSize: 28px;
  --iconSize: 18px;

  background: none;
  border: none;
  outline: none;
  padding: 4px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 8px;
  max-width: var(--maxSize);
  max-height: var(--maxSize);
  width: var(--maxSize);
  height: var(--maxSize);

  &:not(:disabled):hover {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  > svg {
    width: var(--iconSize);
    height: var(--iconSize);
    color: inherit;
    object-fit: contain;
  }
`

export const MenuContent = styled.div`
  position: relative;
  z-index: 2;
  color: var(${UI.COLOR_TEXT_PAPER});
`

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 4px;

  [data-reach-menu-popover] {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
  }
`
