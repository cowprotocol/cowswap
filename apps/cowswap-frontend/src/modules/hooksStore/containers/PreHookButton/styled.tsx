import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-flow: column wrap;
  justify-content: space-between;
  padding: 0;
`

export const AddHookButton = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px dashed var(${UI.COLOR_TEXT_OPACITY_25});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 13px;
  border-radius: 12px;
  width: 100%;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  > svg {
    --size: 16px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    color: currentColor;

    > path {
      fill: currentColor;
    }
  }

  &:hover {
    border-color: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_PRIMARY});
    background-color: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }
`

export const HookList = styled.ul`
  max-width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.8rem;
`
