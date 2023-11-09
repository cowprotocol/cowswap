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
 *
 * @param appCode of the app
 *
 * @returns the appCode that should be used in the metadata, and the widget metadata if it exists
 */
export function useAppCodeWithWidgetMetadata(appCode: string | null): AppCodeWithWidgetMetadata | null {
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
