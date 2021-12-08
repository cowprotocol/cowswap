import { Trans } from '@lingui/macro'
import { /* Currency, */ Percent, TradeType } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { useContext, useState, useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { useHigherUSDValue /* , useUSDCValue */ } from 'hooks/useUSDCPrice'
import { TYPE } from 'theme'
import { isAddress, shortenAddress } from 'utils'
import { ButtonPrimary } from 'components/Button'
// import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { AutoColumn } from 'components/Column'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { TruncatedText, SwapShowAcceptChanges } from 'components/swap/styleds'

import { AdvancedSwapDetails } from 'components/swap/AdvancedSwapDetails'
// import { LightCard } from '../Card'

// import TradePrice from 'components/swap/TradePrice'

// MOD
import TradeGp from 'state/swap/TradeGp'
import { AMOUNT_PRECISION, INPUT_OUTPUT_EXPLANATION } from 'constants/index'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { Field } from 'state/swap/actions'
import { formatMax, formatSmart } from 'utils/format'
import { AuxInformationContainer } from 'components/CurrencyInputPanel'
import FeeInformationTooltip from '../FeeInformationTooltip'
import { LightCardType } from '.'
import { transparentize } from 'polished'
import { Price } from 'pages/Swap'
import { WarningProps } from 'components/SwapWarnings'

export const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.bg1};
  border: 2px solid;
  border-color: ${({ theme }) => theme.bg0};
  z-index: 2;
`

// MOD
export interface SwapModalHeaderProps {
  trade: TradeGp
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  priceImpactWithoutFee?: Percent
  priceImpact?: Percent
  onAcceptChanges: () => void
  LightCard: LightCardType
  HighFeeWarning: React.FC<WarningProps>
  NoImpactWarning: React.FC<WarningProps>
  allowsOffchainSigning: boolean
}

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  priceImpact,
  onAcceptChanges,
  LightCard,
  HighFeeWarning,
  NoImpactWarning,
  allowsOffchainSigning,
}: /* 
{
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
} */

SwapModalHeaderProps) {
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage]
  )

  const theme = useContext(ThemeContext)

  const [showInverted, setShowInverted] = useState<boolean>(false)

  // show fiatValue for unadjusted trade amounts!
  // const fiatValueInput = useUSDCValue(trade.inputAmountWithoutFee)
  // const fiatValueOutput = useUSDCValue(trade.outputAmountWithoutFee)
  const fiatValueInput = useHigherUSDValue(trade.inputAmountWithoutFee)
  const fiatValueOutput = useHigherUSDValue(trade.outputAmountWithoutFee)

  const [slippageIn, slippageOut] = useMemo(
    () => [slippageAdjustedAmounts[Field.INPUT], slippageAdjustedAmounts[Field.OUTPUT]],
    [slippageAdjustedAmounts]
  )

  const [exactInLabel, exactOutLabel] = useMemo(() => {
    return [
      trade?.tradeType === TradeType.EXACT_OUTPUT ? <Trans>From (incl. fee)</Trans> : null,
      trade?.tradeType === TradeType.EXACT_INPUT ? <Trans>Receive (incl. fee)</Trans> : null,
    ]
  }, [trade])

  const fullInputWithoutFee = formatMax(trade?.inputAmountWithoutFee, trade?.inputAmount.currency.decimals) || '-'
  const fullOutputWithoutFee = formatMax(trade?.outputAmountWithoutFee, trade?.outputAmount.currency.decimals) || '-'

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <LightCard flatBorder={!!exactInLabel} padding="0.75rem 1rem">
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>From</Trans>
            </TYPE.body>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
          <RowBetween align="center">
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : ''}
                title={`${fullInputWithoutFee} ${trade.inputAmount.currency.symbol || ''}`}
              >
                {formatSmart(trade.inputAmountWithoutFee, AMOUNT_PRECISION)}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {!!exactInLabel && (
        <AuxInformationContainer margin="-4px auto 4px" hideInput borderColor={transparentize(0.5, theme.bg0)}>
          <FeeInformationTooltip
            amountAfterFees={formatSmart(trade.inputAmountWithFee, AMOUNT_PRECISION)}
            amountBeforeFees={formatSmart(trade.inputAmountWithoutFee, AMOUNT_PRECISION)}
            feeAmount={formatSmart(trade.fee.feeAsCurrency, AMOUNT_PRECISION)}
            allowsOffchainSigning={allowsOffchainSigning}
            label={exactInLabel}
            showHelper
            trade={trade}
            type="From"
            fiatValue={fiatValueInput}
          />
        </AuxInformationContainer>
      )}
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.text2} />
      </ArrowWrapper>
      <LightCard
        flatBorder={!!exactOutLabel}
        padding="0.75rem 1rem"
        style={{ marginBottom: !!exactOutLabel ? '0' : '0.25rem' }}
      >
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>To</Trans>
            </TYPE.body>
            <TYPE.body fontSize={14} color={theme.text3}>
              <FiatValue fiatValue={fiatValueOutput} priceImpact={priceImpact} />
            </TYPE.body>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                title={`${fullOutputWithoutFee} ${trade.outputAmount.currency.symbol || ''}`}
              >
                {formatSmart(trade.outputAmountWithoutFee, AMOUNT_PRECISION)}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {!!exactOutLabel && (
        <AuxInformationContainer margin="-4px auto 4px" hideInput borderColor={transparentize(0.5, theme.bg0)}>
          <FeeInformationTooltip
            amountAfterFees={formatSmart(trade.outputAmount, AMOUNT_PRECISION)}
            amountBeforeFees={formatSmart(trade.outputAmountWithoutFee, AMOUNT_PRECISION)}
            feeAmount={formatSmart(trade.outputAmountWithoutFee?.subtract(trade.outputAmount), AMOUNT_PRECISION)}
            label={exactOutLabel}
            allowsOffchainSigning={allowsOffchainSigning}
            showHelper
            trade={trade}
            type="To"
            fiatValue={fiatValueOutput}
          />
        </AuxInformationContainer>
      )}
      <Price
        trade={trade}
        theme={theme}
        showInverted={showInverted}
        setShowInverted={setShowInverted}
        width="90%"
        margin="auto"
      />
      {/* <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
          <Trans>Price</Trans>
        </TYPE.body>
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </RowBetween> */}

      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </LightCard>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}>
                <Trans>Price Updated</Trans>
              </TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              <Trans>Accept</Trans>
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.italic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                {/* {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol} */}
                {formatSmart(slippageOut, AMOUNT_PRECISION) || '-'} {trade.outputAmount.currency.symbol}
              </b>{' '}
              or the swap will not execute. {INPUT_OUTPUT_EXPLANATION}
            </Trans>
          </TYPE.italic>
        ) : (
          <TYPE.italic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                {/* {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol} */}
                {formatSmart(slippageIn, AMOUNT_PRECISION) || '-'} {trade.inputAmount.currency.symbol}
              </b>{' '}
              {/* or the transaction will revert. */}
              or the swap will not execute. {INPUT_OUTPUT_EXPLANATION}
            </Trans>
          </TYPE.italic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </TYPE.main>
        </AutoColumn>
      ) : null}
      {/* High Fee Warning */}
      <HighFeeWarning trade={trade} />
      {/* No Impact Warning */}
      {!priceImpact && <NoImpactWarning margin="0" />}
    </AutoColumn>
  )
}
