import { INPUT_MIN_HEIGHT_PX, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Input = styled.input`
  --minHeight: ${INPUT_MIN_HEIGHT_PX}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 500;
  border-radius: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: var(--minHeight);
  border: 1px solid transparent;
  color: inherit;
  padding: 10px 16px;
  background: var(${UI.COLOR_PAPER_DARKER});

  ${Media.upToSmall()} {
    font-size: 20px;
  }

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`
