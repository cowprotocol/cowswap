import { RouteComponentProps } from 'react-router-dom'
import styled, { DefaultTheme } from 'styled-components/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { BoxProps, Text } from 'rebass'

import SwapMod from './SwapMod'
import { AutoRow, RowBetween } from 'components/Row'
import { Wrapper as WrapperUni, Container } from 'components/swap/styleds'
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
import { ArrowWrapperLoader, ArrowWrapperLoaderProps, Wrapper as ArrowWrapper } from 'components/ArrowWrapperLoader'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import { Repeat } from 'react-feather'
import { Trans } from '@lingui/macro'
import TradePrice from 'components/swap/TradePrice'
import TradeGp from 'state/swap/TradeGp'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import { RowReceivedAfterSlippage } from 'components/swap/TradeSummary/RowReceivedAfterSlippage'
import { RowFee } from 'components/swap/TradeSummary/RowFee'
import { useExpertModeManager, useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { HighFeeWarning, WarningProps, NoImpactWarning } from 'components/SwapWarnings'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useWalletInfo } from 'hooks/useWalletInfo'

import { MouseoverTooltipContent } from 'components/Tooltip'
import { StyledInfo } from './styleds'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'

import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'

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
interface FeesDiscountProps extends BoxProps {
  theme: DefaultTheme
}

const DarkSpan = styled.span`
  padding: 2px 8px;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 5px;
  color: ${({ theme }) => theme.text1};
`

export const FeesDiscount: React.FC<FeesDiscountProps> = ({ onClick, theme, ...boxProps }: FeesDiscountProps) => {
  const { subsidy } = useCowBalanceAndSubsidy()

  return (
    <LowerSectionWrapper {...boxProps}>
      <Text fontWeight={500} fontSize={14} color={theme.text2} alignItems={'center'}>
        <AutoRow>
          <Trans>Fees discount</Trans>{' '}
          <MouseoverTooltipContent
            content={SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'}
            bgColor={theme.bg1}
            color={theme.text1}
            wrap
          >
            <StyledInfo />
          </MouseoverTooltipContent>
        </AutoRow>
      </Text>

      <div className="price-container">
        <DarkSpan onClick={onClick} style={{ cursor: 'pointer' }}>
          {subsidy?.discount || 0}% discount
        </DarkSpan>
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

export default function Swap(props: RouteComponentProps) {
  const { allowsOffchainSigning } = useWalletInfo()
  return (
    <Container>
      <SwapModWrapper
        TradeBasicDetails={TradeBasicDetails}
        EthWethWrapMessage={EthWethWrapMessage}
        BottomGrouping={BottomGrouping}
        ArrowWrapperLoader={ArrowWrapperLoader}
        Price={Price}
        HighFeeWarning={HighFeeWarning}
        NoImpactWarning={NoImpactWarning}
        allowsOffchainSigning={allowsOffchainSigning}
        FeesDiscount={FeesDiscount}
        {...props}
      />
    </Container>
  )
}

export interface SwapProps extends RouteComponentProps {
  TradeBasicDetails: React.FC<TradeBasicDetailsProp>
  EthWethWrapMessage: React.FC<EthWethWrapProps>
  BottomGrouping: React.FC
  ArrowWrapperLoader: React.FC<ArrowWrapperLoaderProps>
  Price: React.FC<PriceProps>
  HighFeeWarning: React.FC<WarningProps>
  NoImpactWarning: React.FC<WarningProps>
  FeesDiscount: React.FC<FeesDiscountProps>
  className?: string
  allowsOffchainSigning: boolean
}
