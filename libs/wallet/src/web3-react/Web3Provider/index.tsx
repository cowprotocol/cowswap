import { ReactNode, useMemo } from 'react'

import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { useEagerlyConnect } from './hooks/useEagerlyConnect'
import { useOrderedConnections } from './hooks/useOrderedConnections'

import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { Web3ReactConnection } from '../types'

interface Web3ProviderProps {
  children: ReactNode
  selectedWallet: ConnectionType | undefined
}

export function Web3Provider({ children, selectedWallet }: Web3ProviderProps) {
  useEagerlyConnect(selectedWallet)

  const connections = useOrderedConnections(selectedWallet)
  const connectors: [Connector, Web3ReactHooks][] = connections
    .filter(Boolean)
    .map(({ hooks, connector }) => [connector, hooks])

  const key = useMemo(
    () => connections.map(({ type }: Web3ReactConnection) => getConnectionName(type)).join('-'),
    [connections]
  )

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      {children}
    </Web3ReactProvider>
  )
}
