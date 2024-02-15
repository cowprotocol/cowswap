/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Core } from 'types/cytoscape'

import { Command } from '@cowprotocol/common-const'

// Type declaration to module augmentation
declare module 'cytoscape' {
  interface Core {
    removeAllListeners: Command
  }

  interface NodeCollection {
    noOverlap: ({ padding }: { padding: number }) => void
  }
}
