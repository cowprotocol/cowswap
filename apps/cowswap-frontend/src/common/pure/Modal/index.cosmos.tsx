import { Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro' // import useTheme

import { Stepper } from 'common/pure/Stepper'
import { TokenSpinner } from 'common/pure/TokenSpinner'

import { Modal, CowModal, NewModal, NewModalContentTop, NewModalContentBottom } from './index'

const mockToken = new Token(
  1,
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  18,
  'AAVE',
  'Aave Token'
);

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const ModalFixtures = {
  'default modal': (
    <Wrapper>
      <Modal isOpen={true} onDismiss={() => console.log("Dismissed")}>
        Default modal content here
      </Modal>
    </Wrapper>
  ),
  'modal with minHeight and maxHeight': (
    <Wrapper>
      <Modal isOpen={true} onDismiss={() => console.log("Dismissed")} minHeight={50} maxHeight={80}>
        Modal with minHeight and maxHeight
      </Modal>
    </Wrapper>
  ),
  'cow modal': (
    <Wrapper>
      <CowModal isOpen={true} onDismiss={() => console.log("Cow Modal Dismissed")} maxWidth={400}>
        Cow Modal Content
      </CowModal>
    </Wrapper>
  ),
  'cow modal with background color': (
    <Wrapper>
      <CowModal isOpen={true} onDismiss={() => console.log("Cow Modal Dismissed")} maxWidth={400} backgroundColor="pink">
        Cow Modal with Pink Background
      </CowModal>
    </Wrapper>
  ),
  'new modal + content top/bottom': (
    <Wrapper>
      <NewModal>
        <NewModalContentTop paddingTop={90}>
          <TokenSpinner currency={mockToken} size={84} />
          <h3>Approve spending AAVE <br/> on CoW Swap</h3>
        </NewModalContentTop>

        <NewModalContentBottom>
          <p>Sign (gas-free!) in your wallet...</p>
          <Stepper maxWidth={'75%'} steps={[ { stepState: 'active', stepNumber: 1, label: 'Approve' }, { stepState: 'open', stepNumber: 2, label: 'Submit' }, ]} />
        </NewModalContentBottom>
      </NewModal>
    </Wrapper>
  ),
  'new modal + heading title': (
    <Wrapper>
      <NewModal title="Review transaction">
        - New Modal -
      </NewModal>
    </Wrapper>
  ),
}

export default ModalFixtures
