import ICON_ARROW from 'assets/icon/arrow.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { IMAGE_ACCOUNT, MOCK_TOKEN } from 'common/constants/cosmos'
import { IconSpinner } from 'common/pure/IconSpinner'
import { Stepper } from 'common/pure/Stepper'

import { NewModal, NewModalContentBottom, NewModalContentTop } from './index'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const ArrowRight = styled(SVG)`
  --size: 12px;
  width: var(--size);
  height: var(--size);
  margin: auto;

  > path {
    fill: currentColor;
  }
`

const ModalFixtures = {
  'new modal + content top/bottom': (
    <Wrapper>
      <NewModal modalMode>
        <NewModalContentTop paddingTop={90}>
          <IconSpinner currency={MOCK_TOKEN} size={84} />
          <h3>
            Approve spending AAVE <br /> on CoW Swap
          </h3>
        </NewModalContentTop>

        <NewModalContentBottom>
          <p>Sign (gas-free!) in your wallet...</p>
          <Stepper
            maxWidth={'75%'}
            steps={[
              { stepState: 'active', stepNumber: 1, label: 'Approve' },
              { stepState: 'open', stepNumber: 2, label: 'Submit' },
            ]}
          />
        </NewModalContentBottom>
      </NewModal>
    </Wrapper>
  ),
  'new modal + content top/bottom 2': (
    <Wrapper>
      <NewModal modalMode>
        <NewModalContentTop paddingTop={90}>
          <IconSpinner image={IMAGE_ACCOUNT} size={84} />
          <span>
            <h3>Confirm Swap</h3>
            <p>
              10 AAVE <ArrowRight src={ICON_ARROW} /> 564.7202 DAI
            </p>
          </span>
        </NewModalContentTop>

        <NewModalContentBottom>
          <p>Sign (gas-free!) in your wallet...</p>
          <Stepper
            maxWidth={'75%'}
            steps={[
              { stepState: 'finished', stepNumber: 1, label: 'Approved' },
              { stepState: 'active', stepNumber: 2, label: 'Submit' },
            ]}
          />
        </NewModalContentBottom>
      </NewModal>
    </Wrapper>
  ),
  'new modal + heading title': (
    <Wrapper>
      <NewModal modalMode title="Review transaction">
        - New Modal -
      </NewModal>
    </Wrapper>
  ),
}

export default ModalFixtures
