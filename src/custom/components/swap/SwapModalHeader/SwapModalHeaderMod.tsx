import { Trans } from '@lingui/macro'
import { /* Currency, */ Percent, TradeType } from '@uniswap/sdk-core'
import React, { useContext, useMemo } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
// import { InterfaceTrade } from 'state/routing/types'
import styled, { ThemeContext } from 'styled-components/macro'

import { useHigherUSDValue /* , useUSDCValue */ } from 'hooks/useStablecoinPrice'
import { ThemedText } from 'theme'
import { isAddress, shortenAddress } from 'utils'
// import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { ButtonPrimary } from 'components/Button'
// import { LightCard } from '../Card'
import { AutoColumn } from 'components/Column'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
// import TradePrice from 'components/swap/TradePrice'
import { AdvancedSwapDetails } from 'components/swap/AdvancedSwapDetails'
import { SwapShowAcceptChanges, TruncatedText } from 'components/swap/styleds'

// MOD imports
import TradeGp from 'state/swap/TradeGp'
import { INPUT_OUTPUT_EXPLANATION } from 'constants/index'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { Field } from 'state/swap/actions'
import { AuxInformationContainer } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'
import FeeInformationTooltip from '../FeeInformationTooltip'
import { LightCardType } from '.'
import { transparentize } from 'polished'
import { WarningProps } from 'components/SwapWarnings'
import { RateInfo, RateInfoParams } from '@cow/common/pure/RateInfo'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

export const ArrowWrapper = styled.div`
  --size: 26px;
  padding: 0;
  height: var(--size);
  width: var(--size);
  position: relative;
  margin: -13px 0;
  left: calc(50% - var(--size) / 2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  border-radius: 8px;
  border: ${({ theme }) => `2px solid ${theme.grey1}`};
  box-shadow: 0px 0px 0px 3px ${({ theme }) => theme.bg1};
  background: ${({ theme }) => (theme.darkMode ? theme.grey1 : theme.white)};

  > svg {
    stroke-width: 2px;
    padding: 1px;
    height: 100%;
    width: 100%;
    cursor: pointer;
  }
`

const StyledRateInfo = styled(RateInfo)`
  font-size: 13px;
  font-weight: 500;
  margin: 0 auto;
  /* width: 90%; */
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
  NoImpactWarning: React.ReactNode
  allowsOffchainSigning: boolean
  rateInfoParams: RateInfoParams
}

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
  // mod
  priceImpact,
  LightCard,
  HighFeeWarning,
  NoImpactWarning,
  allowsOffchainSigning,
  rateInfoParams,
}: /*
{
  trade: InterfaceTrade<Currency, Currency, TradeType>
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

  // const fiatValueInput = useUSDCValue(trade.inputAmount)
  // const fiatValueOutput = useUSDCValue(trade.outputAmount)
  // show fiatValue for unadjusted trade amounts!
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

  return (
    <AutoColumn
      gap={'4px'}
      // style={{ marginTop: '1rem' }}
    >
      <LightCard flatBorder={!!exactInLabel} padding="0.75rem 1rem">
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <ThemedText.Body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>From</Trans>
            </ThemedText.Body>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
          <RowBetween align="center">
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {/* {trade.inputAmount.currency.symbol} */}
                <TokenSymbol token={trade.inputAmount.currency} /> {/* // MOD */}
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                <TokenAmount amount={trade.inputAmountWithoutFee} />
              </TruncatedText>
            </RowFixed>
            {/*<RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />*/}
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {!!exactInLabel && (
        <AuxInformationContainer
          margin="-4px auto 4px"
          hideInput
          // borderColor={transparentize(0.5, theme.bg0)}
        >
          <FeeInformationTooltip
            amountAfterFees={<TokenAmount amount={trade.inputAmountWithFee} />}
            amountBeforeFees={<TokenAmount amount={trade.inputAmountWithoutFee} />}
            feeAmount={trade.fee.feeAsCurrency}
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
            <ThemedText.Body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>To</Trans>
            </ThemedText.Body>
            <ThemedText.Body fontSize={14} color={theme.text3}>
              <FiatValue fiatValue={fiatValueOutput} priceImpact={priceImpact} />
            </ThemedText.Body>
          </RowBetween>
          <RowBetween align="flex-end">
            {/*<RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade.outputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>*/}
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {/* {trade.outputAmount.currency.symbol} */}
                <TokenSymbol token={trade.outputAmount.currency} /> {/* // MOD */}
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                {<TokenAmount amount={trade.outputAmountWithoutFee} />}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
          {/*<RowBetween>
            <ThemedText.Body fontSize={14} color={theme.text3}>
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)}
              />
            </ThemedText.Body>
          </RowBetween>*/}
        </AutoColumn>
      </LightCard>
      {!!exactOutLabel && (
        <AuxInformationContainer margin="-4px auto 4px" hideInput borderColor={transparentize(0.5, theme.bg0)}>
          <FeeInformationTooltip
            amountAfterFees={<TokenAmount amount={trade.outputAmount} />}
            amountBeforeFees={<TokenAmount amount={trade.outputAmountWithoutFee} />}
            feeAmount={trade.outputAmountWithoutFee?.subtract(trade.outputAmount)}
            label={exactOutLabel}
            allowsOffchainSigning={allowsOffchainSigning}
            showHelper
            trade={trade}
            type="To"
            fiatValue={fiatValueOutput}
          />
        </AuxInformationContainer>
      )}
      <StyledRateInfo label="Price" stylized={true} rateInfoParams={rateInfoParams} />
      {/*<RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </RowBetween>*/}
      {/* <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}> */}
      <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      {/* </LightCard> */}
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <ThemedText.Main
                // color={theme.primary1}
                color={theme.text1} // MOD
              >
                <Trans>Price Updated</Trans>
              </ThemedText.Main>
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
      <AutoColumn
        justify="flex-start"
        gap="sm"
        style={{
          // padding: '.75rem 1rem'
          padding: '24px 10px 16px', // MOD
        }}
      >
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.Italic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                {/* {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol} */}
                <TokenAmount amount={slippageOut} defaultValue="-" tokenSymbol={trade.outputAmount.currency} />{' '}
                {/* // MOD */}
                {/* {trade.outputAmount.currency.symbol} */}
              </b>{' '}
              or the swap will not execute. {INPUT_OUTPUT_EXPLANATION}
            </Trans>
          </ThemedText.Italic>
        ) : (
          <ThemedText.Italic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                {/* {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol} */}
                <TokenAmount amount={slippageIn} defaultValue="-" tokenSymbol={trade.inputAmount.currency} />{' '}
                {/* // MOD */}
              </b>{' '}
              {/* or the transaction will revert. */}
              or the swap will not execute. {INPUT_OUTPUT_EXPLANATION}
            </Trans>
          </ThemedText.Italic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm">
          <ThemedText.Main style={{ padding: '0.75rem 1rem' }}>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.Main>
        </AutoColumn>
      ) : null}
      {/* High Fee Warning */}
      <HighFeeWarning trade={trade} />
      {/* No Impact Warning */}
      {!priceImpact && NoImpactWarning}
    </AutoColumn>
  )
}
