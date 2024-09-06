import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CloseIcon as CloseIconOriginal } from 'common/pure/CloseIcon'

export const HookItemWrapper = styled.li`
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 16px;

  &:hover {
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
    box-shadow: ${({ theme }) => theme.boxShadow1};
  }
`

export const HookItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const HookItemInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  img {
    width: 35px;
    height: 35px;
  }
`

export const ActionBtn = styled.button`
  background: none;
  border: none;
  padding: 10px;
  margin: 0;
  outline: none;
  cursor: pointer;
  border-radius: 12px;
  font-size: 0;

  > svg {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  &:hover {
    background: var(${UI.COLOR_TEXT_OPACITY_10});
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
