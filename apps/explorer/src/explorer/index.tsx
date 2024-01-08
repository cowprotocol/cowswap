import React from 'react'

import ExplorerApp from './ExplorerApp'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(<ExplorerApp />)
} else {
  console.error('Failed to find the root element')
}
