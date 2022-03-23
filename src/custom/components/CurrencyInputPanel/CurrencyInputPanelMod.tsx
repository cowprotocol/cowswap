import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import { darken } from 'polished'
import { ReactNode, useCallback, useState } from 'react'
import { Lock } from 'react-feather'
import styled, { css } from 'styled-components/macro'
// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import useTheme from 'hooks/useTheme'
import { useActiveWeb3React } from 'hooks/web3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { TYPE } from 'theme'
import { ButtonGray } from 'components/Button'
import CurrencyLogo, { StyledLogo } from 'components/CurrencyLogo'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Input as NumericalInput } from 'components/NumericalInput'
import { RowBetween, RowFixed } from 'components/Row'
import { CurrencySearchModal } from '.' // mod
// import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'

import { WithClassName } from 'types'
import { formatMax, formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { FeeInformationTooltipWrapper } from 'components/swap/FeeInformationTooltip'
import { TextWrapper } from '@src/components/HoverInlineText' // mod

export const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

export const Container = styled.div<{ hideInput: boolean; showAux?: boolean }>`
  border-radius: ${({ hideInput, showAux = false }) => (showAux ? '20px 20px 0 0' : hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }
`

// mod - due to circular dependencies and lazy loading
// mod - this custom component has to be here rather than ./index.tsx
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

export const CurrencySelect = styled(ButtonGray)<{ visible: boolean; selected: boolean; hideInput?: boolean }>`
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  align-items: center;
  font-size: 24px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 16px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`

export const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
`

export const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
`

export const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

export const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
`

export const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme }) => theme.primary5};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};
  margin-left: 0.25rem;

  :focus {
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

export const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin}
`

// mod - due to circular dependencies and lazy loading
// mod - this custom component has to be here rather than ./index.tsx
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

  ${CurrencySelect} {
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

  // Reset the cursor for the FIAT estimate & price impact
  ${TextWrapper} {
    &:hover,
    + span:hover {
      cursor: initial;
    }
  }
`

export interface CurrencyInputPanelProps extends WithClassName {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  priceImpactLoading?: boolean
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
  customBalanceText?: string
  disableCurrencySelect?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  priceImpactLoading,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  label,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <InputPanel id={id} hideInput={hideInput} {...rest}>
        {locked && (
          <FixedContainer>
            <AutoColumn gap="sm" justify="center">
              <Lock />
              <TYPE.label fontSize="12px" textAlign="center" padding="0 12px">
                <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
              </TYPE.label>
            </AutoColumn>
          </FixedContainer>
        )}
        <Container hideInput={hideInput} showAux={!!label}>
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!onCurrencySelect}>
            <CurrencySelect
              visible={currency !== null}
              selected={!!currency}
              hideInput={hideInput}
              className="open-currency-select-button"
              onClick={() => {
                if (onCurrencySelect) {
                  setModalOpen(true)
                }
              }}
            >
              <Aligner>
                <RowFixed>
                  {pair ? (
                    <span style={{ marginRight: '0.5rem' }}>
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                    </span>
                  ) : currency ? (
                    <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={currency} size={'24px'} />
                  ) : null}
                  {pair ? (
                    <StyledTokenName className="pair-name-container">
                      {pair?.token0.symbol}:{pair?.token1.symbol}
                    </StyledTokenName>
                  ) : (
                    <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                      {(currency && currency.symbol && currency.symbol.length > 20
                        ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                        : currency?.symbol) || <Trans>Select a token</Trans>}
                    </StyledTokenName>
                  )}
                </RowFixed>
                {onCurrencySelect && <StyledDropDown selected={!!currency} />}
              </Aligner>
            </CurrencySelect>
            {!hideInput && (
              <StyledNumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={onUserInput}
                $loading={loading}
              />
            )}
          </InputRow>
          {!hideInput && !hideBalance && (
            <FiatRow>
              <RowBetween>
                {account ? (
                  <RowFixed
                  // style={{ height: '17px' }}
                  >
                    <TYPE.body
                      onClick={onMax}
                      // color={theme.text2}
                      color={theme.text1}
                      fontWeight={400}
                      fontSize={14}
                      style={{
                        display: 'inline',
                        // cursor: 'pointer'
                        cursor: showMaxButton ? 'pointer' : 'initial', // mod
                      }}
                      title={`${formatMax(selectedCurrencyBalance, currency?.decimals) || '-'} ${
                        currency?.symbol || ''
                      }`}
                    >
                      {!hideBalance && currency && selectedCurrencyBalance ? (
                        renderBalance ? (
                          renderBalance(selectedCurrencyBalance)
                        ) : (
                          <Trans>
                            Balance: {formatSmart(selectedCurrencyBalance, AMOUNT_PRECISION) || '0'} {currency.symbol}
                          </Trans>
                        )
                      ) : null}
                    </TYPE.body>
                    {showMaxButton && selectedCurrencyBalance ? (
                      <StyledBalanceMax onClick={onMax}>
                        <Trans>(Max)</Trans>
                      </StyledBalanceMax>
                    ) : null}
                  </RowFixed>
                ) : (
                  <span />
                )}
                <LoadingOpacityContainer $loading={loading}>
                  <FiatValue priceImpactLoading={priceImpactLoading} fiatValue={fiatValue} priceImpact={priceImpact} />
                </LoadingOpacityContainer>
              </RowBetween>
            </FiatRow>
          )}
        </Container>
        {onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
            showCurrencyAmount={showCurrencyAmount}
            disableNonToken={disableNonToken}
          />
        )}
      </InputPanel>
      {/* Fee Information */}
      {!!label && <AuxInformationContainer hideInput>{label}</AuxInformationContainer>}
    </>
  )
}
