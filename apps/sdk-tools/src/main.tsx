import { StrictMode } from 'react'

import 'inter-ui'
import { createRoot } from 'react-dom/client'

import { SdkTools } from './SdkTools'

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
