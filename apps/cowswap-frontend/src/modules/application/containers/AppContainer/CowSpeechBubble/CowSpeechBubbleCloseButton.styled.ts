import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CloseButton = styled.button`
  --size: 28px;
  position: absolute;
  top: -8px;
  right: -8px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  border: none;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 19px;
  line-height: 1;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 500;
  display: grid;
  place-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;
  z-index: 3;
  box-shadow: 0 6px 14px -12px rgba(0, 0, 0, 0.7);
  transition:
    color 0.2s ease,
    transform 0.2s ease;

  > span {
    transform: translateY(-1px);
  }

  &:hover {
    color: var(${UI.COLOR_TEXT});
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PAPER_DARKER});
    outline-offset: 2px;
  }

  ${Media.upToSmall()} {
    --size: 26px;
    top: -8px;
    right: -8px;
    font-size: 18px;
  }
`
