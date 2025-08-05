import { ReactNode } from 'react'

import { useAppData } from '../../hooks/useAppData'
import { RowWithCopyButton } from '../common/RowWithCopyButton'
import Spinner from '../common/Spinner'
import { Notification } from '../Notification'

interface AppDataContentProps {
  appData: string
  fullAppData?: string
  showDecodedAppData: boolean
}

export function AppDataContent({ appData, fullAppData, showDecodedAppData }: AppDataContentProps): ReactNode {
  const {
    isLoading: appDataLoading,
    appDataDoc: decodedAppData,
    hasError: appDataError,
  } = useAppData(appData, fullAppData)

  const appDataString = JSON.stringify(decodedAppData, null, 2)

  if (appDataLoading) return <Spinner />

  if (showDecodedAppData) {
    if (appDataError)
      return (
        <Notification type="error" message="Error when getting metadata info." closable={false} appendMessage={false} />
      )
    return (
      <RowWithCopyButton
        textToCopy={appDataString}
        contentsToDisplay={<pre className="json-formatter">{appDataString}</pre>}
      />
    )
  }

  return null
}
