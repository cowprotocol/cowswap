import { useCallback, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled, { DefaultTheme } from 'styled-components/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { BoxProps, Text } from 'rebass'

import { ButtonSize, TYPE } from 'theme/index'

import SwapMod from './SwapMod'
import { AutoRow, RowBetween } from 'components/Row'
import { Wrapper as WrapperUni, Dots } from 'components/swap/styleds'
import { AutoColumn } from 'components/Column'
import { ClickableText } from 'pages/Pool/styleds'
import { InputContainer } from 'components/AddressInputPanel'
import { GreyCard } from 'components/Card'
import Card from 'components/Card'
import {
  ButtonError as ButtonErrorMod,
  ButtonPrimary as ButtonPrimaryMod,
  ButtonLight as ButtonLightMod,
} from 'components/Button'
import EthWethWrap, { Props as EthWethWrapProps } from 'components/swap/EthWethWrap'
import { useReplaceSwapState, useSwapState } from 'state/swap/hooks'
import { ArrowWrapperLoader, ArrowWrapperLoaderProps, Wrapper as ArrowWrapper } from 'components/ArrowWrapperLoader'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT, LONG_LOAD_THRESHOLD } from 'constants/index'
import { Repeat } from 'react-feather'
import { Trans } from '@lingui/macro'
import TradePrice from 'components/swap/TradePrice'
import TradeGp from 'state/swap/TradeGp'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import { RowReceivedAfterSlippage } from 'components/swap/TradeSummary/RowReceivedAfterSlippage'
import { RowFee } from 'components/swap/TradeSummary/RowFee'
import { useExpertModeManager, useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { HighFeeWarning, HighFeeWarningProps } from 'components/HighFeeWarning'
import { useHigherUSDValue } from 'hooks/useUSDCPrice'
import { useWalletInfo } from 'hooks/useWalletInfo'

interface TradeBasicDetailsProp extends BoxProps {
  trade?: TradeGp
  fee: CurrencyAmount<Currency>
}

const BottomGrouping = styled.div`
  > div > button {
    align-self: stretch;
  }

  div > svg,
  div > svg > path {
    stroke: ${({ theme }) => theme.text2};
  }
`

export const ButtonError = styled(ButtonErrorMod)`
  > div,
  > div > div {
    width: 100%;
    word-break: break-all;
    text-align: center;
    align-items: center;
  }
`

export const ButtonPrimary = styled(ButtonPrimaryMod)`
  > div,
  > div > div {
    width: 100%;
    word-break: break-all;
    text-align: center;
    align-items: center;
  }
`

export const ButtonLight = styled(ButtonLightMod)`
  > div,
  > div > div {
    width: 100%;
    word-break: break-all;
    text-align: center;
    align-items: center;
  }
`

const SwapModWrapper = styled(SwapMod)`
  ${(props) => props.className} {
    // For now to target <SwapHeader /> without copying files...
    > div:first-child {
      padding: 0 12px 4px;
      max-width: 100%;
      margin: 0;
    }

    ${WrapperUni} {
      padding: 4px 4px 0;
    }

    ${AutoColumn} {
      grid-row-gap: 8px;
      margin: 0 0 12px;
    }

    ${ClickableText} {
      color: ${({ theme }) => theme.text1};
    }

    ${Card} > ${AutoColumn} {
      margin: 4px auto 0;
      font-size: 13px;
      grid-row-gap: 0;

      > div > div,
      > div > div div {
        color: ${({ theme }) => theme.text1};
        font-size: 13px;
      }
    }

    ${GreyCard} {
      > div {
        color: ${({ theme }) => theme.text1};
      }
    }

    ${InputContainer} > div > div > div {
      color: ${({ theme }) => theme.text1};
    }

    .expertMode ${ArrowWrapper} {
      position: relative;
    }

    ${AutoRow} {
      z-index: 2;
    }
  }
`
export interface SwapProps extends RouteComponentProps {
  TradeBasicDetails: React.FC<TradeBasicDetailsProp>
  EthWethWrapMessage: React.FC<EthWethWrapProps>
  SwitchToWethBtn: React.FC<SwitchToWethBtnProps>
  FeesExceedFromAmountMessage: React.FC
  BottomGrouping: React.FC
  TradeLoading: React.FC<TradeLoadingProps>
  SwapButton: React.FC<SwapButtonProps>
  ArrowWrapperLoader: React.FC<ArrowWrapperLoaderProps>
  Price: React.FC<PriceProps>
  HighFeeWarning: React.FC<HighFeeWarningProps>
  className?: string
  allowsOffchainSigning: boolean
}

const LowerSectionWrapper = styled(RowBetween).attrs((props) => ({
  ...props,
  align: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  minHeight: 24,
}))`
  > .price-container {
    display: flex;
    gap: 5px;
  }
`

const PriceSwitcher = styled(AutoRow)`
  flex-flow: row nowrap;
  gap: 4px;
  min-width: 55px;

  > svg {
    cursor: pointer;
    border-radius: 20px;
    background: ${({ theme }) => theme.bg4};
    padding: 4px;
  }
`

interface PriceProps extends BoxProps {
  trade: TradeGp
  theme: DefaultTheme
  showInverted: boolean
  setShowInverted: React.Dispatch<React.SetStateAction<boolean>>
}

export const Price: React.FC<PriceProps> = ({
  trade,
  theme,
  showInverted,
  setShowInverted,
  ...boxProps
}: PriceProps) => {
  return (
    <LowerSectionWrapper {...boxProps}>
      <Text fontWeight={500} fontSize={14} color={theme.text2}>
        <PriceSwitcher>
          <Trans>Price</Trans>
          <Repeat size={20} onClick={() => setShowInverted((prev) => !prev)} />
        </PriceSwitcher>
      </Text>
      <div className="price-container">
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </div>
    </LowerSectionWrapper>
  )
}

export const LightGreyText = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.text4};
`

function TradeBasicDetails({ trade, fee, ...boxProps }: TradeBasicDetailsProp) {
  const allowedSlippage = useUserSlippageToleranceWithDefault(INITIAL_ALLOWED_SLIPPAGE_PERCENT)
  const [isExpertMode] = useExpertModeManager()
  const { allowsOffchainSigning } = useWalletInfo()

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const feeFiatValue = useHigherUSDValue(trade?.fee.feeAsCurrency || fee)

  return (
    <LowerSectionWrapper {...boxProps}>
      {/* Fees */}
      {(trade || fee) && (
        <RowFee
          trade={trade}
          showHelpers={true}
          allowsOffchainSigning={allowsOffchainSigning}
          fee={fee}
          feeFiatValue={feeFiatValue}
        />
      )}

      {isExpertMode && trade && (
        <>
          {/* Slippage */}
          <RowSlippage allowedSlippage={allowedSlippage} />

          {/* Min/Max received */}
          <RowReceivedAfterSlippage
            trade={trade}
            allowedSlippage={allowedSlippage}
            showHelpers={true}
            allowsOffchainSigning={allowsOffchainSigning}
          />
        </>
      )}
    </LowerSectionWrapper>
  )
}

function EthWethWrapMessage(props: EthWethWrapProps) {
  return (
    <RowBetween>
      <EthWethWrap {...props} />
    </RowBetween>
  )
}

interface SwitchToWethBtnProps {
  wrappedToken: Token
}

function SwitchToWethBtn({ wrappedToken }: SwitchToWethBtnProps) {
  const replaceSwapState = useReplaceSwapState()
  const { independentField, typedValue, OUTPUT } = useSwapState()

  return (
    <ButtonPrimary
      buttonSize={ButtonSize.BIG}
      id="swap-button"
      onClick={() =>
        replaceSwapState({
          inputCurrencyId: wrappedToken.address,
          outputCurrencyId: OUTPUT.currencyId ?? undefined,
          typedValue,
          recipient: null,
          field: independentField,
        })
      }
    >
      <TYPE.main mb="4px">Switch to {wrappedToken.symbol}</TYPE.main>
    </ButtonPrimary>
  )
}

function FeesExceedFromAmountMessage() {
  return (
    <RowBetween>
      <ButtonError buttonSize={ButtonSize.BIG} error id="swap-button" disabled>
        <Text fontSize={20} fontWeight={500}>
          Fees exceed from amount
        </Text>
      </ButtonError>
    </RowBetween>
  )
}

const fadeIn = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`

const CenteredDots = styled(Dots)<{ smaller?: boolean }>`
  vertical-align: ${({ smaller = false }) => (smaller ? 'normal' : 'super')};
`

const LongLoadText = styled.span`
  animation: fadeIn 0.42s ease-in;

  ${fadeIn}
`

type TradeLoadingProps = {
  showButton?: boolean
}

const TradeLoading = ({ showButton = false }: TradeLoadingProps) => {
  const [isLongLoad, setIsLongLoad] = useState<boolean>(false)

  // change message if user waiting too long
  useEffect(() => {
    const timeout = setTimeout(() => setIsLongLoad(true), LONG_LOAD_THRESHOLD)

    return () => clearTimeout(timeout)
  }, [])

  const InsideContent = useCallback(
    () => (
      <TYPE.main display="flex" alignItems="center" maxHeight={20}>
        <Text fontSize={isLongLoad ? 14 : 40} fontWeight={500}>
          {isLongLoad && <LongLoadText>Hang in there. Calculating best price </LongLoadText>}
          <CenteredDots smaller={isLongLoad} />
        </Text>
      </TYPE.main>
    ),
    [isLongLoad]
  )

  return showButton ? (
    <ButtonError id="swap-button" buttonSize={ButtonSize.BIG} disabled={true} maxHeight={60}>
      {InsideContent()}
    </ButtonError>
  ) : (
    InsideContent()
  )
}

interface SwapButtonProps extends TradeLoadingProps {
  showLoading: boolean
  children: React.ReactNode
}

const SwapButton = ({ children, showLoading, showButton = false }: SwapButtonProps) =>
  showLoading ? (
    <TradeLoading showButton={showButton} />
  ) : (
    <Text fontSize={16} fontWeight={500}>
      {children}
    </Text>
  )

export default function Swap(props: RouteComponentProps) {
  const { allowsOffchainSigning } = useWalletInfo()
  return (
    <SwapModWrapper
      TradeBasicDetails={TradeBasicDetails}
      EthWethWrapMessage={EthWethWrapMessage}
      SwitchToWethBtn={SwitchToWethBtn}
      FeesExceedFromAmountMessage={FeesExceedFromAmountMessage}
      BottomGrouping={BottomGrouping}
      SwapButton={SwapButton}
      TradeLoading={TradeLoading}
      ArrowWrapperLoader={ArrowWrapperLoader}
      Price={Price}
      HighFeeWarning={HighFeeWarning}
      allowsOffchainSigning={allowsOffchainSigning}
      {...props}
    />
  )
}
