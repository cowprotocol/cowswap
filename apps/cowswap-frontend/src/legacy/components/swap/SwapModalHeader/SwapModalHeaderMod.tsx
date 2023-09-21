import React, { useContext, useMemo } from 'react'

import { INPUT_OUTPUT_EXPLANATION } from '@cowprotocol/common-const'
import { isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { TokenAmount, TokenSymbol, RowBetween, RowFixed } from '@cowprotocol/ui'
import { Percent, TradeType } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { transparentize } from 'polished'
import { ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { AdvancedSwapDetails } from 'legacy/components/swap/AdvancedSwapDetails'
import { AuxInformationContainer, TruncatedText } from 'legacy/components/swap/styleds'
import { WarningProps } from 'legacy/components/SwapWarnings'
import TradeGp from 'legacy/state/swap/TradeGp'
import { Field } from 'legacy/state/types'
import { ThemedText } from 'legacy/theme'
import { computeSlippageAdjustedAmounts } from 'legacy/utils/prices'

import { PriceUpdatedBanner } from 'modules/trade/pure/PriceUpdatedBanner'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { CurrencyLogo } from 'common/pure/CurrencyLogo'
import { FiatValue } from 'common/pure/FiatValue'
import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import FeeInformationTooltip from '../FeeInformationTooltip'

import { LightCardType } from './index'

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
`

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
  priceImpact,
  LightCard,
  HighFeeWarning,
  NoImpactWarning,
  allowsOffchainSigning,
  rateInfoParams,
}: SwapModalHeaderProps) {
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage]
  )

  const theme = useContext(ThemeContext)

  const {
    inputAmount: { value: fiatValueInput },
    outputAmount: { value: fiatValueOutput },
  } = useTradeUsdAmounts(trade.inputAmountWithoutFee, trade.outputAmountWithoutFee)

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
    <AutoColumn gap={'4px'}>
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
                <TokenSymbol token={trade.inputAmount.currency} />
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                <TokenAmount amount={trade.inputAmountWithoutFee} />
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {!!exactInLabel && (
        <AuxInformationContainer margin="-4px auto 4px" hideInput>
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
        style={{ marginBottom: exactOutLabel ? '0' : '0.25rem' }}
      >
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <ThemedText.Body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>To</Trans>
            </ThemedText.Body>
            <ThemedText.Body fontSize={14} color={theme.text3}>
              <FiatValue fiatValue={fiatValueOutput} priceImpactParams={{ priceImpact, loading: false }} />
            </ThemedText.Body>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                <TokenSymbol token={trade.outputAmount.currency} />
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                {<TokenAmount amount={trade.outputAmountWithoutFee} />}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
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
      <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      {showAcceptChanges && <PriceUpdatedBanner onClick={onAcceptChanges} />}
      <AutoColumn
        justify="flex-start"
        gap="sm"
        style={{
          padding: '24px 10px 16px',
        }}
      >
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.Italic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                <TokenAmount amount={slippageOut} defaultValue="-" tokenSymbol={trade.outputAmount.currency} />{' '}
              </b>{' '}
              or the swap will not execute. {INPUT_OUTPUT_EXPLANATION}
            </Trans>
          </ThemedText.Italic>
        ) : (
          <ThemedText.Italic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                <TokenAmount amount={slippageIn} defaultValue="-" tokenSymbol={trade.inputAmount.currency} />{' '}
              </b>{' '}
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
