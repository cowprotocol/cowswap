import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CloseIcon as CloseIconOriginal } from 'common/pure/CloseIcon'

export const HookItemWrapper = styled.li`
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  box-shadow: 0 5px 16px 0 transparent;
  transition: all 0.2s ease-in-out;

  &:hover {
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_50});
    box-shadow: 0 5px 16px 0 var(${UI.COLOR_PRIMARY_OPACITY_25});
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
  font-weight: 600;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  background: var(${UI.COLOR_PAPER});
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`

export const DragIcon = styled.div`
  box-sizing: content-box;
  width: 10px;
  height: 16px;

  > svg {
    width: 100%;
    height: 100%;

  }
`

export const HookItemInfo = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 8px;


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

export const CustomLink = styled.a`
  margin: 0.5em 0;
  padding: 0 10em;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`

export const CloseIcon = styled(CloseIconOriginal)`
  position: absolute;
  top: 0;
  right: 0;
`

export const SimulateContainer = styled.div`
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
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
