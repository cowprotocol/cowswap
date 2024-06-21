declare module 'styled-components' {
  export interface CowSwapDefaultTheme extends CowProtocolTheme {
    isInjectedWidgetMode: boolean
  }

  export interface DefaultTheme extends CowSwapDefaultTheme {}
}
