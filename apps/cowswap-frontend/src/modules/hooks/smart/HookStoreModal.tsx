import styled from 'styled-components/macro'

import { NewModal } from 'common/pure/NewModal'

const MODAL_MAX_WIDTH = 450

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: ${MODAL_MAX_WIDTH}px;
`

export function HookStoreModal({ onDismiss }: { onDismiss: Command }) {
  return (
    <Wrapper>
      <NewModal modalMode title="Hook Store" onDismiss={onDismiss} maxWidth={MODAL_MAX_WIDTH}>
        Hook store
      </NewModal>
    </Wrapper>
  )
}
