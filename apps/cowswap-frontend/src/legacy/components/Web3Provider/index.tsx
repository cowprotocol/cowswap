import { ReactNode } from 'react'

import { networkConnection } from '@cowprotocol/wallet'
import { Web3ReactProvider } from '@web3-react/core'

const connectors: any[] = [[networkConnection.connector, networkConnection.hooks]]

export default function Web3Provider({ children }: { children: ReactNode }) {
  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
}
