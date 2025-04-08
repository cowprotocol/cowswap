import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 0;
`

export const AdvancedDropdownButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  font-size: 14px;
  padding: 10px;
  border: 0;
  outline: none;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  background: none;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    text-decoration: underline;
  }
`

export const AdvancedWrapper = styled.div<{ open: boolean; error: boolean }>`
  width: 100%;
  border: ${({ open, error }) =>
    open ? `1px solid var(${error ? UI.COLOR_ALERT_TEXT : UI.COLOR_TEXT_OPACITY_10})` : 0};
  border-radius: 8px;
  margin-top: ${({ open }) => (open ? '10px' : 0)};
  padding: ${({ open }) => (open ? '10px' : 0)};
  transition:
    padding 0.3s,
    margin-top 0.2s;
`

export const AdvancedDropdown = styled.div<{ height: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-height: ${({ height }) => height}px;
  transition: ${({ height }) => (height ? `max-height 0.5s` : 'max-height 0.2s')};
  overflow: hidden;
`

export const TextWrapper = styled.div`
  align-items: center;
  display: flex;
  font-size: 15px;
  margin-bottom: 10px;
  padding: 5px 0;
`

export const ValidationText = styled.div`
  color: var(${UI.COLOR_ALERT_TEXT});
  margin-bottom: 10px;
  font-size: 14px;
`

export const AdvancedApproveButton = styled.button`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  line-height: 0;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 0;
  border-radius: 16px;
  background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border: 1px solid var(${UI.COLOR_PRIMARY_OPACITY_25});

  &:hover:enabled {
    background: var(${UI.COLOR_PRIMARY_OPACITY_25});
    color: var(${UI.COLOR_TEXT});
    border: 1px solid var(${UI.COLOR_PRIMARY_OPACITY_50});
  }

  &:disabled {
    opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
    cursor: auto;
  }
`

export const AmountInput = styled.div<{ invalid: boolean }>`
  display: inline-block;
  cursor: text;
  padding: 4px 5px;
  font-weight: 600;
  border-radius: 6px;
  margin: 0 3px;
  max-width: 200px;
  word-wrap: break-word;
  color: ${({ invalid }) => (invalid ? `var(${UI.COLOR_ALERT_TEXT})` : '')};

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:focus {
    outline: none;
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`
