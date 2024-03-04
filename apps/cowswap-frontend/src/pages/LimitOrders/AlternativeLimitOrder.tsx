import { useCallback } from 'react'

import styled from 'styled-components/macro'

import { LimitOrdersWidget } from 'modules/limitOrders'
import { useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import { NewModal } from 'common/pure/NewModal'

const MODAL_MAX_WIDTH = 450

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: ${MODAL_MAX_WIDTH}px;
`

export function AlternativeLimitOrder() {
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()

  const onDismiss = useCallback(() => hideAlternativeOrderModal(), [hideAlternativeOrderModal])

  return (
    <Wrapper>
      <NewModal modalMode title={'Recreate limit order'} onDismiss={onDismiss} maxWidth={MODAL_MAX_WIDTH}>
        <LimitOrdersWidget />
      </NewModal>
    </Wrapper>
  )
}
