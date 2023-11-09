import { useMemo } from 'react'

import { environmentName } from '@cowprotocol/common-utils'

import { AppDataWidget } from 'modules/appData/types'

import { useInjectedWidgetMetaData } from './useInjectedWidgetMetaData'

export function useAppDataWidget(): AppDataWidget | undefined {
  const injectedWidgetMetadata = useInjectedWidgetMetaData()

  const appCode = injectedWidgetMetadata?.appCode

  return useMemo<AppDataWidget | undefined>(
    () =>
      appCode
        ? {
            appCode,
            environment: environmentName,
          }
        : undefined,
    [appCode]
  )
}
