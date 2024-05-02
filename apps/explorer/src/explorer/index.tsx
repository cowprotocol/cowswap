import React from 'react'

import { createRoot } from 'react-dom/client'

import ExplorerApp from './ExplorerApp'

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(<ExplorerApp />)
} else {
  console.error('Failed to find the root element')
}
