import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const IconButton = styled.button<{ hasNotification?: boolean }>`
  --height: 42px;
  --overlap: 16px;

  position: relative;
  width: auto;
  height: var(--height);
  display: ${({ theme }) => (theme.isWidget ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  margin: 0;
  position: relative;
  background: transparent;
  border: none;
  padding: 0 12px 0 calc(8px + var(--overlap));
  margin-left: calc(var(--overlap) * -1);
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});

    &::after {
      opacity: 1;
    }
  }

  & > span {
    position: relative;
    display: flex;
  }

  & > span::after {
    content: '';
    --size: 8px;
    box-sizing: content-box;
    position: absolute;
    top: 0;
    right: 0;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    transform: translate(50%, -50%);
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    background: ${({ hasNotification }) => (hasNotification ? `var(${UI.COLOR_DANGER})` : 'transparent')};
  }
`
