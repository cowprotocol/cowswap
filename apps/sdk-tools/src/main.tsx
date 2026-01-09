import { StrictMode } from 'react'

import 'inter-ui'
import { getRpcProvider } from '@cowprotocol/common-const'
import { setGlobalAdapter, SupportedChainId } from '@cowprotocol/cow-sdk'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'

import { createRoot } from 'react-dom/client'

import { SdkTools } from './SdkTools'

// Initialize the global adapter for the CoW SDK
const adapter = new EthersV5Adapter({
  provider: getRpcProvider(SupportedChainId.MAINNET)!,
})
setGlobalAdapter(adapter)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Root() {
  return (
    <StrictMode>
      <SdkTools />
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
