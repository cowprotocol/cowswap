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
import CurrencySearchModalUni from '@src/components/SearchModal/CurrencySearchModal'
import { RowBetween } from 'components/Row'
import { FeeInformationTooltipWrapper } from 'components/swap/FeeInformationTooltip'

import { StyledLogo } from 'components/CurrencyLogo'
import { LONG_LOAD_THRESHOLD } from 'constants/index'

export const CurrencySearchModal = styled(CurrencySearchModalUni)`
  > [data-reach-dialog-content] {
    max-width: 520px;
    background-color: ${({ theme }) => theme.bg1};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
      border-radius: 0;
    `}
  }
`

export const AuxInformationContainer = styled(Container)<{
  margin?: string
  borderColor?: string
  borderWidth?: string
}>`
  margin: ${({ margin = '0 auto' }) => margin};
  border-radius: 0 0 15px 15px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: auto;
    flex-flow: column wrap;
    justify-content: flex-end;
    align-items: flex-end;
  `}

  > ${FeeInformationTooltipWrapper} {
    align-items: center;
    justify-content: space-between;
    margin: 0 16px;
    padding: 16px 0;
    font-weight: 600;
    font-size: 14px;
    height: auto;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      width: 100%;
      align-items: flex-start;
      margin: 0;
      padding: 16px;
    `}

    > span {
      font-size: 18px;
      gap: 2px;
      word-break: break-all;
      text-align: right;

      ${({ theme }) => theme.mediaWidth.upToSmall`  
        text-align: left;
        align-items: flex-start;
        width: 100%;
      `};
    }

    > span:first-child {
      font-size: 14px;
      display: flex;
      align-items: center;
      white-space: nowrap;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        margin: 0 0 10px;
      `}
    }

    > span > small {
      opacity: 0.75;
      font-size: 13px;
      font-weight: 500;
    }
  }
`

export const Wrapper = styled.div<{ selected: boolean; showLoader: boolean }>`
  // CSS Override

  ${InputPanel} {
    background: transparent;
    color: ${({ theme }) => theme.currencyInput?.color};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;

      > div > div > input {
        width: 100%;
        text-align: left;
        padding: 0;
        margin: 20px 0 8px;
        word-break: break-all;
      }
    `};

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

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      padding: 1rem 1rem 0 1rem;
    `};

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

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 0 auto 0;
    `};
  }

  ${Container} {
    background: ${({ theme }) => (theme.currencyInput?.background ? theme.currencyInput?.background : theme.bg1)};
    border: ${({ theme }) =>
      theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};

    &:hover {
      border: ${({ theme }) =>
        theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};
    }
  }

  ${AuxInformationContainer} {
    background-color: ${({ theme }) => darken(0.0, theme.bg1 || theme.bg3)};
    border-top: none;

    &:hover {
      background-color: ${({ theme }) => darken(0.0, theme.bg1 || theme.bg3)};
      border-top: none;
    }
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

    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
    `};

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

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
    `}

    > div > div > span,
    > div {
      color: ${({ theme }) => theme.currencyInput?.color};
    }

    // Balance Wrapper
    > div:first-of-type {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        margin: 10px 0 0;
        width: 100%;
        opacity: 0.75;
      `}
    }

    // USD estimation
    > div:last-of-type {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        order: -1;
        width: 100%;
        text-align: left;
        justify-content: flex-start;
        display: flex;
      `}
    }

    // Balance text
    ${({ theme }) => theme.mediaWidth.upToSmall`
      > div > div {
        word-break: break-all;
      }
    `}
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
