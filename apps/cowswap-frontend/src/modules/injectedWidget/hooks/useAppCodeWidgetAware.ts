import { useMemo } from 'react'

import { environmentName } from '@cowprotocol/common-utils'

import { AppDataWidget } from 'modules/appData/types'

import { useInjectedWidgetMetaData } from './useInjectedWidgetMetaData'

export interface AppCodeWithWidgetMetadata {
  appCode: string
  environment?: string
  widget?: AppDataWidget
}

/**
 * The final "appCode" used in the appData is different depending on whether the app is being used in the widget mode or not.
 *
 * In order to make the official `appCode` of the app not widget aware (to depend only on the appCode of the app), we use this
 * widget that will use the official `appCode` and the injected metadata from the widget to derive the 3 depending filds:
 *   - appCode: the official `appCode` of the app when not used in the widget mode, or the `appCode` of the host app using the widget
 *   - environment: the environment of the app when not used in the widget mode, or not specified in widget mode
 *   - widget: The widget metadata if in widget mode
 *
 */
export function useAppCodeWidgetAware(appCode: string | null): AppCodeWithWidgetMetadata | null {
  const injectedWidgetMetadata = useInjectedWidgetMetaData()

  const appCodeWidget = injectedWidgetMetadata?.appCode

  return useMemo(() => {
    if (!appCode) {
      return null
    }

    if (appCodeWidget) {
      return {
        appCode: appCodeWidget,
        widget: {
          appCode,
          environment: environmentName,
        },
      }
    }

    return {
      appCode,
      environment: environmentName,
    }
  }, [appCode, appCodeWidget])
}
