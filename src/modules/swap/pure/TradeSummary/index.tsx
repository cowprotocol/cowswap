import styled from 'styled-components/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { AutoColumn } from 'legacy/components/Column'

import { TradeSummaryProps } from 'modules/swap/containers/TradeSummary'
// Sub-components
import { RowFee } from 'modules/swap/containers/Row/RowFee'
import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { RowReceivedAfterSlippage } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'
import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'

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
