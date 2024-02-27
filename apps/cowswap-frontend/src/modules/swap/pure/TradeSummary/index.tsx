import { PartnerFee } from '@cowprotocol/widget-lib'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'

import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'
import { RowFee, RowPartnerFee } from 'modules/swap/containers/Row/RowFee'
import { RowReceivedAfterSlippage } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'
import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { TradeSummaryProps } from 'modules/swap/containers/TradeSummary'

// Sub-components

const Wrapper = styled.div``

export interface TradeSummaryContentProps extends TradeSummaryProps {
  fee: CurrencyAmount<Token> | null
  partnerFee?: PartnerFee
  allowsOffchainSigning: boolean
}

export function TradeSummaryContent(props: TradeSummaryContentProps) {
  const { showFee, trade, fee: feeFiatValue, partnerFee, allowsOffchainSigning, showHelpers, allowedSlippage } = props
  return (
    <Wrapper>
      <AutoColumn gap="2px">
        {/* Slippage */}
        {showFee && (
          <RowFee
            trade={trade}
            feeInFiat={feeFiatValue}
            allowsOffchainSigning={allowsOffchainSigning}
            showHelpers={showHelpers}
          />
        )}

        {partnerFee && (
          <RowPartnerFee
            showHelpers={true}
            partnerFee={partnerFee}
            feeAmount={CurrencyAmount.fromRawAmount(trade.inputAmount.currency, '100000000000000')}
            feeInFiat={feeFiatValue}
          />
        )}

        {/* Slippage */}
        <RowSlippage allowedSlippage={allowedSlippage} showSettingOnClick={false} />

        {/* Transaction settings (eth flow only) */}
        <RowDeadline />

        {/* Min/Max received */}
        <RowReceivedAfterSlippage trade={trade} showHelpers={showHelpers} allowedSlippage={allowedSlippage} />
      </AutoColumn>
    </Wrapper>
  )
}
