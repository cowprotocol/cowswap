import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from 'state'
import { ReactNode } from 'react'

export * from '../test-utils'

class MockedConnector extends Connector {
  activate(): Promise<void> {
    return Promise.resolve()
  }

  getActions() {
    return this.actions
  }
}

export const [mockedConnector, mockedConnectorHooks] = initializeConnector<MockedConnector>(
  (actions) => new MockedConnector(actions)
)

export function WithMockedWeb3({ children }: { children?: ReactNode }) {
  const connectors: [Connector, Web3ReactHooks][] = [[mockedConnector, mockedConnectorHooks]]

  return (
    <HashRouter>
      <Provider store={store}>
        <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
      </Provider>
    </HashRouter>
  )
}
