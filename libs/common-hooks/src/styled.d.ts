import 'styled-components/macro'
import { Theme } from '@cowprotocol/types'

declare module 'styled-components/macro' {
  export interface DefaultTheme extends Theme {}
}

// Re-export for the base package
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
