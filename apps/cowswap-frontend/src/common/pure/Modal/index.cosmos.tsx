import styled from 'styled-components/macro'

import { CowModal, Modal } from './index'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const ModalFixtures = {
  'default modal': (
    <Wrapper>
      <Modal isOpen={true} onDismiss={() => console.log('Dismissed')} id="default-modal">
        Default modal content here
      </Modal>
    </Wrapper>
  ),
  'modal with minHeight and maxHeight': (
    <Wrapper>
      <Modal
        isOpen={true}
        onDismiss={() => console.log('Dismissed')}
        minHeight={50}
        maxHeight={80}
        id="modal-with-min-and-max-height"
      >
        Modal with minHeight and maxHeight
      </Modal>
    </Wrapper>
  ),
  'cow modal': (
    <Wrapper>
      <CowModal isOpen={true} onDismiss={() => console.log('Cow Modal Dismissed')} maxWidth={400} id="cow-modal">
        Cow Modal Content
      </CowModal>
    </Wrapper>
  ),
  'cow modal with background color': (
    <Wrapper>
      <CowModal
        isOpen={true}
        onDismiss={() => console.log('Cow Modal Dismissed')}
        maxWidth={400}
        backgroundColor="pink"
        id="cow-modal-with-background-color"
      >
        Cow Modal with Pink Background
      </CowModal>
    </Wrapper>
  ),
}

export default ModalFixtures
