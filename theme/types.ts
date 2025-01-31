import type { CowProtocolTheme } from '../libs/types/src/theme'

declare module 'styled-components' {
  export interface CowFiDefaultTheme extends CowProtocolTheme {}

  export interface DefaultTheme extends CowFiDefaultTheme {}
}
