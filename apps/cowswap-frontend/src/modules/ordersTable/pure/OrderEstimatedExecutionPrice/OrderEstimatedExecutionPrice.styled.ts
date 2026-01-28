
import styled from 'styled-components/macro'
import { darken } from 'color2k'
import {
    SymbolElement,
    UI,
  } from '@cowprotocol/ui'
  
export const OrderEstimatedExecutionPriceWrapper = styled.span<{ $hasWarning: boolean; $showPointerCursor: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: ${({ $hasWarning, theme }) => ($hasWarning ? darken(theme.alert, theme.darkMode ? 0 : 0.15) : 'inherit')};
  cursor: ${({ $showPointerCursor }) => ($showPointerCursor ? 'pointer' : 'default')};

  ${SymbolElement} {
    color: inherit;
  }

  // Popover container override

  > div > div,
  > span {
    display: flex;
    align-items: center;
  }
`

export const UnfillableLabel = styled.span`
  width: auto;
  color: var(${UI.COLOR_DANGER});
  position: relative;
  display: flex;
  align-items: center;
  font-size: inherit;
  font-weight: 500;
  line-height: 1.1;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 3px;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  svg > path {
    fill: currentColor;
    stroke: none;
  }
`

export const WarningContent = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: help;
`

export const ApprovalLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: inherit;
  color: inherit;
  text-decoration: underline;
  color: var(${UI.COLOR_PRIMARY});
  font-weight: 500;

  &:hover {
    opacity: 1;
  }
`

export const ApproveLoaderWrapper = styled.div`
  text-align: center;
  width: 100%;
`
