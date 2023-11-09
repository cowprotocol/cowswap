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
 * @param appCodeOfficial the official `appCode` of the app
 *
 */
export function useAppCodeWidgetAware(appCodeOfficial: string | null): AppCodeWithWidgetMetadata | null {
  const injectedWidgetMetadata = useInjectedWidgetMetaData()

  const appCodeInjectedHostApp = injectedWidgetMetadata?.appCode

  return useMemo(() => {
    // appCodeOfficial is required for generating the appData, if not provided, return null
    if (!appCodeOfficial) {
      return null
    }

    // If running in widget mode, and the host app injects us an appCode
    if (appCodeInjectedHostApp) {
      return {
        // The main appCode will be the one of the host app that uses the widget
        appCode: appCodeInjectedHostApp,
        widget: {
          // In the widget appCode we include the official appCode and environment (this way we report which app is backing the widget iframe)
          appCode: appCodeOfficial,
          environment: environmentName,
        },
      }
    }

    // Return the official appCode and environment as the main appCode/environment in the appData
    return {
      appCode: appCodeOfficial,
      environment: environmentName,
    }
  }, [appCodeOfficial, appCodeInjectedHostApp])
}
