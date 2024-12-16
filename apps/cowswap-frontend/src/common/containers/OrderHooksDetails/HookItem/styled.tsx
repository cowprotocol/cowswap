import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const HookItemWrapper = styled.li`
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  box-shadow: 0 5px 16px 0 transparent;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;

  &:hover {
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_50});
    box-shadow: 0 5px 16px 0 var(${UI.COLOR_PRIMARY_OPACITY_25});
  }
`

export const HookItemHeader = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px 6px 5px;
  font-size: 14px;
  gap: 8px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  background: var(${UI.COLOR_PAPER});
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  transition: all 0.2s ease-in-out;
`

export const HookItemInfo = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
  user-select: none;

  > img {
    --size: 26px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    border-radius: 9px;
    background-color: var(${UI.COLOR_PAPER_DARKER});
    padding: 2px;
  }

  > span {
    font-weight: 500;
  }
`

export const HookNumber = styled.i`
  --minSize: 26px;
  min-height: var(--minSize);
  min-width: var(--minSize);
  border-radius: 9px;
  margin: 0;
  padding: 3px 6px;
  color: var(${UI.COLOR_TEXT});
  font-weight: 500;
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px dotted transparent;
  font-style: normal;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
`

export const HookItemContent = styled.div`
  padding: 10px;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  margin: 10px 0 0;

  > p {
    margin: 0 0 1rem;
    word-break: break-all;
    font-weight: var(${UI.FONT_WEIGHT_NORMAL});

    &:last-child {
      margin: 0;
    }
  }

  > p > b {
    color: var(${UI.COLOR_TEXT});
    display: block;
    margin: 0 0 0.25rem;
    text-transform: capitalize;
  }

  > p > a {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    text-decoration: underline;

    &:hover {
      color: var(${UI.COLOR_TEXT});
    }
  }
`

export const ToggleButton = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0.7)};
  transition: opacity ${UI.ANIMATION_DURATION_SLOW} ease-in-out;
  outline: none;

  &:hover {
    opacity: 1;
  }
`

export const ToggleIcon = styled.div<{ isOpen: boolean }>`
  --size: 16px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    width: var(--size);
    height: var(--size);
    object-fit: contain;

    path {
      fill: var(${UI.COLOR_TEXT});
    }
  }
`

export const SimulationLink = styled.span<{ status: boolean }>`
  color: var(${({ status }) => (status ? UI.COLOR_SUCCESS : UI.COLOR_DANGER)});
  border-radius: 8px;

  &:hover {
    color: var(${({ status }) => (status ? UI.COLOR_SUCCESS_TEXT : UI.COLOR_DANGER_TEXT)});
  }
`
