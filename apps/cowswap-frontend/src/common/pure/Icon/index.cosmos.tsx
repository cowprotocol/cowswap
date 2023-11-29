import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Icon, IconType } from './index'

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

const IconFixtures = {
  'icon ALERT / default size': (
    <Wrapper>
      <Icon image={IconType.ALERT} />
    </Wrapper>
  ),
}

export default IconFixtures
