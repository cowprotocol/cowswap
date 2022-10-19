import styled from 'styled-components/macro'
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

export function TradeSummaryContent(props: TradeSummaryProps) {
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
            fontSize={12}
            fontWeight={400}
            rowHeight={24}
          />
        )}

        {/* Slippage */}
        <RowSlippage
          allowedSlippage={allowedSlippage}
          fontSize={12}
          fontWeight={400}
          rowHeight={24}
          showSettingOnClick={false}
        />

        {/* Min/Max received */}
        <RowReceivedAfterSlippage
          trade={trade}
          showHelpers={showHelpers}
          allowedSlippage={allowedSlippage}
          fontSize={12}
          fontWeight={400}
          rowHeight={24}
        />
      </AutoColumn>
    </Wrapper>
  )
}
