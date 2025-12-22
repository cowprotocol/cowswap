import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'

class MockedConnector extends Connector {
  activate(): Promise<void> {
    return Promise.resolve()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getActions() {
    return this.actions
  }
}

export const [mockedConnector, mockedConnectorHooks] = initializeConnector<MockedConnector>(
  (actions) => new MockedConnector(actions),
)
