import styled from 'styled-components/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'

import { TradeSummaryProps } from '@cow/modules/swap/containers/TradeSummary'
// Sub-components
import { RowFee } from '@cow/modules/swap/containers/RowFee'
import { RowSlippage } from '@cow/modules/swap/containers/RowSlippage'
import { RowReceivedAfterSlippage } from '@cow/modules/swap/containers/RowReceivedAfterSlippage'

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text4};
    }
  }
`

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

        {/* Min/Max received */}
        <RowReceivedAfterSlippage trade={trade} showHelpers={showHelpers} allowedSlippage={allowedSlippage} />
      </AutoColumn>
    </Wrapper>
  )
}
