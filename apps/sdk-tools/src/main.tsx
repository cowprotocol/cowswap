import { ReactNode, StrictMode } from 'react'

import 'inter-ui'
import './cowSdkAdapter'
import { Web3Provider } from '@cowprotocol/wallet'

import { createRoot } from 'react-dom/client'

import { SdkTools } from './SdkTools'

function Root(): ReactNode {
  return (
    <StrictMode>
      <Web3Provider>
        <SdkTools />
      </Web3Provider>
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
