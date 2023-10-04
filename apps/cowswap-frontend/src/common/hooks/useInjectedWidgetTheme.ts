// The theme parameters provided by a consumer
export interface InjectedWidgetTheme {
  primaryColor: string
  screenBackground: string
  widgetBackground: string
  textColor: string
}

// TODO: get theme from injected provider
export function useInjectedWidgetTheme(): InjectedWidgetTheme {
  return {
    primaryColor: '#d9258e',
    screenBackground: '#c7860f',
    widgetBackground: '#eed4a7',
    textColor: '#413931',
  }
}
