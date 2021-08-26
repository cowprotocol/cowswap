import React from 'react'
import styled from 'styled-components'
import { AdvancedSwapDetailsProps } from '../AdvancedSwapDetails'

import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'

// Sub-components
import { RowFee } from './RowFee'
import { RowSlippage } from './RowSlippage'
import { RowReceivedAfterSlippage } from './RowReceivedAfterSlippage'
import { useWalletInfo } from 'hooks/useWalletInfo'

export function getIncludeFeeLabelSuffix(allowsOffchainSigning: boolean) {
  return allowsOffchainSigning ? ' (incl. fee)' : ''
}

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text4};
    }
  }
`

export type TradeSummaryProps = Required<AdvancedSwapDetailsProps>

export default function TradeSummary({ trade, allowedSlippage, showHelpers, showFee }: TradeSummaryProps) {
  const { allowsOffchainSigning } = useWalletInfo()

  return (
    <Wrapper>
      <AutoColumn gap="2px">
        {/* Slippage */}
        {showFee && (
          <RowFee
            trade={trade}
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
          allowsOffchainSigning={allowsOffchainSigning}
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
