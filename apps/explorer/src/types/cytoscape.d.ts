/* eslint-disable-next-line @typescript-eslint/no-unused-vars */

import { Command } from '@cowprotocol/types'

// Type declaration to module augmentation
declare module 'cytoscape' {
  interface Core {
    removeAllListeners: Command
  }

  interface NodeCollection {
    noOverlap: ({ padding }: { padding: number }) => void
  }
}
