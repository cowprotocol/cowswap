import type { ReactNode } from 'react'

import { AssetsExplorer } from './AssetsExplorer'

export function HomePage(): ReactNode {
  return (
    <>
      <h1>Tokenized stocks</h1>
      <AssetsExplorer />
    </>
  )
}
