// import { darken } from 'polished'
import React from 'react'
import styled, { css } from 'styled-components'
import { darken } from 'polished'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing } from 'state/price/hooks'

import CurrencyInputPanelMod, {
  CurrencyInputPanelProps,
  CurrencySelect as CurrencySelectMod,
  InputRow,
  InputPanel,
  LabelRow,
  Container,
  StyledBalanceMax,
} from './CurrencyInputPanelMod'
import { RowBetween } from 'components/Row'
import { FeeInformationTooltipWrapper } from 'components/swap/FeeInformationTooltip'

import { StyledLogo } from 'components/CurrencyLogo'
import { LONG_LOAD_THRESHOLD } from 'constants/index'

export const Wrapper = styled.div<{ selected: boolean; showLoader: boolean }>`
  // CSS Override

  ${InputPanel} {
    background: transparent;
    color: ${({ theme }) => theme.currencyInput?.color};

    &:hover {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${LabelRow} {
    color: ${({ theme }) => theme.currencyInput?.color};
    span:hover {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${InputRow} {
    background: transparent;
    > input,
    > input::placeholder {
      background: transparent;
      color: inherit;
    }

    > input::placeholder {
      opacity: 0.5;
    }
  }

  ${StyledBalanceMax} {
    color: ${({ theme }) => theme.primary4};
  }

  ${FeeInformationTooltipWrapper} {
    font-weight: 600;
    font-size: 14px;

    > span {
      font-size: 18px;
      gap: 2px;
    }

    > span:first-child {
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    > span > small {
      opacity: 0.75;
      font-size: 13px;
      font-weight: 500;
    }
  }

  ${Container} {
    background: ${({ theme }) => (theme.currencyInput?.background ? theme.currencyInput?.background : theme.bg1)};
    border: ${({ theme }) =>
      theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};
  }

  ${({ showLoader, theme }) =>
    showLoader &&
    css`
      #swap-currency-output ${Container} {
        position: relative;
        display: inline-block;

        overflow: hidden;
        &::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            ${theme.shimmer1} 20%,
            ${theme.shimmer2} 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
          content: '';
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      }
    `}

  ${CurrencySelectMod} {
    z-index: 2;
    color: ${({ selected, theme }) =>
      selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
    transition: background-color 0.2s ease-in-out;

    &:focus {
      background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
    }
    &:hover {
      background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    }

    path {
      stroke: ${({ selected, theme }) =>
        selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
      stroke-width: 1.5px;
    }
  }

  ${RowBetween} {
    color: ${({ theme }) => theme.currencyInput?.color};

    > div > div > span,
    > div {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${StyledLogo} {
    background: ${({ theme }) => theme.bg1};
  }
`

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const { currency } = props
  const isRefreshingQuote = useIsQuoteRefreshing()
  const showLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  return (
    <Wrapper selected={!!currency} showLoader={showLoader}>
      <CurrencyInputPanelMod {...props} />
    </Wrapper>
  )
}

export default CurrencyInputPanel
