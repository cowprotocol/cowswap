import { ReactNode } from 'react'

import { AddIntermediateTokenModal } from 'modules/tokensList'
import { TradeWidget } from 'modules/trade'

import { useSwapWidgetViewModel } from './hooks/useSwapWidgetViewModel'
import { Container } from './styled'

import { BottomBanners } from '../BottomBanners'

export interface SwapWidgetProps {
  topContent?: ReactNode
  bottomContent?: ReactNode
}

export function SwapWidget({ topContent, bottomContent }: SwapWidgetProps): ReactNode {
  const viewModel = useSwapWidgetViewModel({ topContent, bottomContent })

  return (
    <Container>
      {viewModel.showAddIntermediateTokenModal ? (
        <AddIntermediateTokenModal {...viewModel.addIntermediateModalHandlers} />
      ) : (
        <TradeWidget {...viewModel.tradeWidgetProps} />
      )}
      <BottomBanners />
    </Container>
  )
}
