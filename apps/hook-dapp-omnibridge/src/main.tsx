import { StrictMode } from 'react'

import 'inter-ui'
import { createRoot } from 'react-dom/client'

import { OmnibridgeApp } from './app/hook-dapp'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Root() {
  return (
    <StrictMode>
      <OmnibridgeApp />
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
