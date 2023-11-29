import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { MOCK_TOKEN, IMAGE_ACCOUNT } from 'common/constants/cosmos'

import { IconSpinner } from './index'

const Wrapper = styled.div`
  width: 400px;
  height: 400px;
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 100px;
`

const SpinnerFixtures = {
  'token image / default size': (
    <Wrapper>
      <IconSpinner currency={MOCK_TOKEN} />
    </Wrapper>
  ),
  'token image / custom size': (
    <Wrapper>
      <IconSpinner currency={MOCK_TOKEN} size={84} />
    </Wrapper>
  ),
  'token image / custom size + spinnerWidth': (
    <Wrapper>
      <IconSpinner currency={MOCK_TOKEN} size={84} spinnerWidth={4} />
    </Wrapper>
  ),
  'regular image / custom size': (
    <Wrapper>
      <IconSpinner image={IMAGE_ACCOUNT} size={84} />
    </Wrapper>
  ),
  'no children': (
    <Wrapper>
      <IconSpinner />
    </Wrapper>
  ),
}

export default SpinnerFixtures
