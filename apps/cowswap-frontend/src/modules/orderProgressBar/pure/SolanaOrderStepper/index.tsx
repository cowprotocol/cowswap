import { ReactNode } from 'react'

import svgSendSrc from '@cowprotocol/assets/cow-swap/send.svg'
import { UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

// Reused so the Solana "waiting for confirmation" step looks like EthFlowStepper's own
// CREATING-state step (same circular pending-spinner icon, label and explorer-link styling).
import { ExplorerLinkStyled, Step } from 'modules/ethFlow/pure/EthFlowStepper/Step'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 30px 22px;
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 15px;
  line-height: 1;
`

export interface SolanaOrderStepperProps {
  order: Order | undefined
}

export function shouldShowSolanaOrderStepper(order: Order | undefined): boolean {
  return order?.status === OrderStatus.CREATING
}

export function SolanaOrderStepper({ order }: SolanaOrderStepperProps): ReactNode {
  if (!order || !shouldShowSolanaOrderStepper(order)) {
    return null
  }

  return (
    <Wrapper id="solana-order-stepper">
      <Step state="pending" icon={svgSendSrc} label={t`Creating order on Solana`}>
        {order.orderCreationHash && (
          <ExplorerLinkStyled type="transaction" label={t`View transaction`} id={order.orderCreationHash} />
        )}
      </Step>
    </Wrapper>
  )
}
