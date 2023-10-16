import styled from 'styled-components/macro'

import { CowModal, Modal } from './index'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const ModalFixtures = {
  'default modal': (
    <Wrapper>
      <Modal isOpen={true} onDismiss={() => console.log('Dismissed')}>
        Default modal content here
      </Modal>
    </Wrapper>
  ),
  'modal with minHeight and maxHeight': (
    <Wrapper>
      <Modal isOpen={true} onDismiss={() => console.log('Dismissed')} minHeight={50} maxHeight={80}>
        Modal with minHeight and maxHeight
      </Modal>
    </Wrapper>
  ),
  'cow modal': (
    <Wrapper>
      <CowModal isOpen={true} onDismiss={() => console.log('Cow Modal Dismissed')} maxWidth={400}>
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
      >
        Cow Modal with Pink Background
      </CowModal>
    </Wrapper>
  ),
}

export default ModalFixtures
