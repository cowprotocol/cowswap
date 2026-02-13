import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ hasSelectedItems: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin: 0 0 0 ${({ hasSelectedItems }) => (hasSelectedItems ? '' : 'auto')};

  ${Media.upToSmall()} {
    width: 100%;
    justify-content: flex-end;
    margin: 10px auto 5px;
  }
`

export const ActionButton = styled.button`
  display: inline-flex;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  font-weight: 600;
  text-decoration: none;
  font-size: 12px;
  padding: 6px 8px;
  margin: 0;
  gap: 2px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 24px;
  vertical-align: center;

  &:hover:not([disabled]) {
    background: var(${UI.COLOR_DANGER_BG});
  }

  &[disabled] {
    background: transparent;
    outline: 1px solid var(${UI.COLOR_PAPER_DARKER});
  }
`

export const TextButton = styled.button`
  display: inline-block;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 12px;
  font-weight: 500;
  padding: 0;
  cursor: pointer;
  background: none;
  outline: none;
  border: none;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const CancelAllButton = styled(TextButton)`
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.danger};
    text-decoration: underline;
  }
`
