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

  &:hover {
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_50});
    box-shadow: 0 5px 16px 0 var(${UI.COLOR_PRIMARY_OPACITY_25});
  }

  &.blue-background-class {
    background: var(${UI.COLOR_INFO_BG});
    color: var(${UI.COLOR_INFO_TEXT});
    border: 1px dotted var(${UI.COLOR_INFO_TEXT});
  }
`

export const HookItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-size: 14px;
  gap: 8px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  background: var(${UI.COLOR_PAPER});
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  transition: all 0.2s ease-in-out;
`

export const DragIcon = styled.div`
  box-sizing: content-box;
  width: 10px;
  height: 16px;
  cursor: grab;
  flex: 0 0 auto;

  > svg {
    width: 100%;
    height: 100%;
    color: var(${UI.COLOR_TEXT});
  }

  > svg > path {
    fill: currentColor;
  }
`

export const HookItemInfo = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 8px;
  cursor: grab;
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

  .blue-background-class & {
    background: var(${UI.COLOR_INFO_BG});
    color: var(${UI.COLOR_INFO_TEXT});
    border: 2px dotted var(${UI.COLOR_INFO_TEXT});
  }
`

export const HookItemActions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 8px;
`

export const ActionBtn = styled.button<{ actionType?: 'remove' | 'edit' }>`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 0;

  &:hover {
    background: ${({ actionType }) =>
      actionType === 'remove' ? `var(${UI.COLOR_DANGER_BG})` : `var(${UI.COLOR_ALERT_BG})`};
    > svg {
      color: ${({ actionType }) =>
        actionType === 'remove' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_ALERT_TEXT})`};
    }
  }

  > svg {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    padding: 5px;
    box-sizing: content-box;
  }
`

export const SimulateContainer = styled.div<{ isSuccessful: boolean }>`
  --colorBG: ${({ isSuccessful }) => (isSuccessful ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_DANGER_BG})`)};
  --colorText: ${({ isSuccessful }) =>
    isSuccessful ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_DANGER_TEXT})`};

  border: 1px solid var(--colorBG);
  background: var(--colorBG);
  color: var(--colorText);
  border-radius: 9px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
  font-size: 14px;

  > svg {
    margin: 0 7px 0 0;
    color: inherit;
  }

  > svg > path {
    fill: currentColor;
  }

  > a,
  > span {
    margin: 0 auto 0 0;
    color: inherit;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`

export const OldSimulateContainer = styled.div`
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`

export const SimulateHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  margin-bottom: 5px;
  min-width: 150px;
`

export const SimulateFooter = styled.div`
  color: var(${UI.COLOR_TEXT2});
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;

  > svg {
    height: 16px;
    width: 70px;
    display: inline-block;
    background: #fff;
    border-radius: 4px;
    padding: 2px;
  }
`

export const Spinner = styled.div`
  border: 5px solid transparent;
  border-top-color: ${`var(${UI.COLOR_PRIMARY_LIGHTER})`};
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
