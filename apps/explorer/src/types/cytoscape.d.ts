/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Core } from 'types/cytoscape'

// Type declaration to module augmentation
declare module 'cytoscape' {
  interface Core {
    removeAllListeners: () => void
  }

  interface NodeCollection {
    noOverlap: ({ padding }: { padding: number }) => void
  }
}
