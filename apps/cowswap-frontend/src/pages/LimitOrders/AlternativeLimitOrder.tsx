import styled from 'styled-components/macro'

import { LimitOrdersWidget } from 'modules/limitOrders'
import { useAlternativeOrder, useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import { NewModal } from 'common/pure/NewModal'

const MODAL_MAX_WIDTH = 450

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: ${MODAL_MAX_WIDTH}px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AlternativeLimitOrder() {
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()
  const { isEdit } = useAlternativeOrder() || {}

  if (isEdit === undefined) {
    return null
  }

  const title = `${isEdit ? 'Edit' : 'Recreate'} limit order`

  return (
    <Wrapper>
      <NewModal modalMode title={title} onDismiss={hideAlternativeOrderModal} maxWidth={MODAL_MAX_WIDTH}>
        <LimitOrdersWidget />
      </NewModal>
    </Wrapper>
  )
}
