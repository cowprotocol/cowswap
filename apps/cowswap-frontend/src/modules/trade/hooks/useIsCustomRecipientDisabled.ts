import { useInjectedWidgetParams } from 'entities/injectedWidget'

/**
 * Whether a custom recipient can be used at all. Drives the recipient input and the reset of any
 * recipient left in trade state.
 */
export function useIsCustomRecipientDisabled(): boolean {
  const { disableCustomRecipient } = useInjectedWidgetParams()

  return Boolean(disableCustomRecipient)
}
