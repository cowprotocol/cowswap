import { StrictMode } from 'react'

import 'inter-ui'
import { createRoot } from 'react-dom/client'

import { SdkTools } from './SdkTools'

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
