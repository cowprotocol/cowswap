import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { AutoColumn } from '../../../../legacy/components/Column'

import { RowDeadline } from '../../containers/Row/RowDeadline'
import { RowFee } from '../../containers/Row/RowFee'
import { RowReceivedAfterSlippage } from '../../containers/Row/RowReceivedAfterSlippage'
import { RowSlippage } from '../../containers/Row/RowSlippage'
import { TradeSummaryProps } from '../../containers/TradeSummary'

// Sub-components

const Wrapper = styled.div``

export interface TradeSummaryContentProps extends TradeSummaryProps {
  fee: CurrencyAmount<Token> | null
  allowsOffchainSigning: boolean
}

export function TradeSummaryContent(props: TradeSummaryContentProps) {
  const { showFee, trade, fee: feeFiatValue, allowsOffchainSigning, showHelpers, allowedSlippage } = props
  return (
    <Wrapper>
      <AutoColumn gap="2px">
        {/* Slippage */}
        {showFee && (
          <RowFee
            trade={trade}
            feeFiatValue={feeFiatValue}
            allowsOffchainSigning={allowsOffchainSigning}
            showHelpers={showHelpers}
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
