import { UI } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

export const InfoPopup = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.3;
  background: ${`linear-gradient(90deg, var(${UI.COLOR_PAPER}) 0%, var(${UI.COLOR_PAPER_DARKER}) 100%)`};
  border-radius: 16px;
  color: inherit;
  padding: 15px 34px 15px 15px;

  .icon {
    --size: 32px;
    display: flex;
    align-items: center;
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    color: inherit;
  }

  .icon > svg {
    --size: 32px;
    width: 100%;
    height: 100%;
    color: inherit;
    opacity: 0.6;

    > path {
      fill: currentColor;
    }
  }

  .content > a {
    color: inherit;
    text-decoration: underline;

    &::after {
      content: ' ↗';
      display: inline-block;
      font-size: 12px;
    }
  }
`

export const CloseIcon = styled(X)`
  --size: 16px;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  stroke-width: 3px;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  height: var(--size);
  width: var(--size);
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`
