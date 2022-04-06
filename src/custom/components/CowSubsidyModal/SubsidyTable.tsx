import styled from 'styled-components/macro'
import { formatSmartLocaleAware } from 'utils/format'
import { COW_SUBSIDY_DATA } from './constants'
import { CowSubsidy } from '.'
import { transparentize } from 'polished'

import { BigNumber } from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import { V_COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { useIsDarkMode } from 'state/user/hooks'

const StyledSubsidyTable = styled.table`
  width: 100%;
  margin: 0 0 24px;

  thead,
  tbody {
    width: 100%;
    display: block;
  }

  tbody {
    border-radius: 16px;
    border: none;
    border: 1px solid ${({ theme }) => theme.text2};
  }

  thead > tr {
    border: 0;
  }
`

const SubsidyTr = styled.tr<{ selected?: boolean; darkMode?: boolean }>`
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid transparent;
  gap: 0;
  background: transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.4, theme.text2)};

  &:last-child {
    border-bottom: 0;
  }

  > th {
    font-size: 14px;
    font-weight: 500;
  }

  > td {
    font-size: 15px;
  }

  > td:first-child {
    border-right: 1px solid ${({ theme }) => transparentize(0.4, theme.text2)};
  }

  > td,
  > th {
    padding: 12px;
    text-align: center;
  }

  ${({ selected, theme, darkMode }) =>
    selected &&
    `
    background: ${darkMode ? transparentize(0.85, theme.orange) : transparentize(0.75, theme.orange)};

    &::before {
      position: absolute;
      left: 16px;
      top: 0;
      bottom: 0;
      margin: auto;
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 6px;
      background-color: ${theme.orange};
      animation: 2s ease-in-out infinite pulse;
      box-shadow: 0;
    }

    &::after {
      content: '';
      height: calc(100% + 3px);
      width:  calc(100% + 4px);
      display: block;
      top: -2px;
      left: -2px;
      position: absolute;
      border-radius: 3px;
      border: 2px solid ${theme.orange};
    }

    &:first-child,
    &:first-child::after {
      border-radius: 16px 16px 3px 3px;
    }

    &:last-child,
    &:last-child::after {
      border-radius: 3px 3px 16px 16px;
    }
    
    > td {
      color: ${darkMode ? theme.orange : theme.text1};
      font-weight: 500;

      &:first-child {
        display: flex;
        align-items: center; 
        justify-content: center;
      }

      &:last-child {
        border-left: none;
      }
    }
  `}

  ${({ theme }) =>
    `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 ${transparentize(0.7, theme.orange)};
      }

      100% {
        box-shadow: 0 0 0 8px ${transparentize(1, theme.orange)};
      }
    }
  `}
`

const COW_DECIMALS = V_COW[SupportedChainId.MAINNET].decimals

function SubsidyTable({ discount }: CowSubsidy) {
  const darkMode = useIsDarkMode()

  return (
    <StyledSubsidyTable>
      <thead>
        <SubsidyTr>
          <th>(v)COW balance</th>
          <th>Fee discount</th>
        </SubsidyTr>
      </thead>
      <tbody>
        {/* DATA IS IN ATOMS */}
        {COW_SUBSIDY_DATA.map(([threshold, thresholdDiscount], i) => {
          const selected = discount === thresholdDiscount
          const formattedThreshold = new BigNumber(formatUnits(threshold, COW_DECIMALS))

          return (
            <SubsidyTr key={i} selected={selected} darkMode={darkMode}>
              <td>
                <span>{i && '>' + formatSmartLocaleAware(formattedThreshold)}</span>
              </td>
              <td>{thresholdDiscount}%</td>
            </SubsidyTr>
          )
        })}
      </tbody>
    </StyledSubsidyTable>
  )
}

export default SubsidyTable
