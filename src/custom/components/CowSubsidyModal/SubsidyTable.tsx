import styled from 'styled-components/macro'
import { COW_SUBSIDY_DATA } from './constants'
import { CowSubsidy } from '.'
import { transparentize, lighten } from 'polished'

import { V_COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { useIsDarkMode } from 'state/user/hooks'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { CurrencyAmount } from '@uniswap/sdk-core'

const StyledSubsidyTable = styled.table`
  width: 100%;
  margin: 0 0 24px;

  thead,
  tbody {
    width: 100%;
    display: block;
  }

  tbody {
    background: ${({ theme }) => theme.grey1};
    border-radius: 16px;
    border: 0;
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
  border-bottom: 1px solid ${({ theme }) => transparentize(0.7, theme.text2)};

  &:last-child {
    border-bottom: 0;
  }

  &:hover > td {
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => transparentize(0.9, theme.text1)};
  }

  > th {
    font-size: 14px;
    font-weight: 500;
  }

  > td {
    font-size: 15px;
    color: ${({ theme }) => theme.text2};
    transition: background 0.3s ease-in-out;
  }

  > td:first-child {
    border-right: 1px solid ${({ theme }) => transparentize(0.7, theme.text2)};
  }

  > td,
  > th {
    padding: 12px;
    text-align: center;
  }

  ${({ selected, theme, darkMode }) =>
    selected &&
    `
    background: ${theme.bg2};
    color: ${theme.white};
    transition: background 0.2s ease-in-out;

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
      background-color: ${theme.white};
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
      border: 0;
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
      color: ${theme.white};
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

    &:hover {
      background: ${lighten(0.05, theme.bg2)};

        > td {
          background: transparent;
          color: ${theme.white};
        }
    }
  `}

  ${({ theme }) =>
    `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 ${transparentize(0.7, theme.white)};
      }

      100% {
        box-shadow: 0 0 0 8px ${transparentize(1, theme.white)};
      }
    }
  `}
`

const vCowToken = V_COW[SupportedChainId.MAINNET]

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
          const formattedThreshold = CurrencyAmount.fromRawAmount(vCowToken, threshold)

          return (
            <SubsidyTr key={i} selected={selected} darkMode={darkMode}>
              <td>
                <span>
                  {i && '>'}
                  {i && <TokenAmount amount={formattedThreshold} />}
                </span>
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
