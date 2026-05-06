import { ReactNode, useEffect, useMemo, useState } from 'react'

import * as styledEl from './AppDataContent.styles'
import {
  AppDataTab,
  getStoredView,
  stringifyJson,
  parseQuoteBody,
  APPDATA_VIEW_STORAGE_KEY,
} from './AppDataContent.utils'

import { useAppData } from '../../hooks/useAppData'
import { CopyButton } from '../common/CopyButton'
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

  const [tab, setTab] = useState<AppDataTab>(() => getStoredView())

  const jsonData = useMemo(() => {
    return stringifyJson(tab === 'raw' ? decodedAppData : parseQuoteBody(decodedAppData))
  }, [tab, decodedAppData])

  useEffect(() => {
    window.localStorage.setItem(APPDATA_VIEW_STORAGE_KEY, tab)
  }, [tab])

  if (appDataLoading) return <Spinner />

  if (!showDecodedAppData) return null

  if (appDataError)
    return (
      <Notification type="error" message="Error when getting metadata info." closable={false} appendMessage={false} />
    )

  return (
    <styledEl.JsonPanel>
      <styledEl.TopRow>
        <styledEl.Tabs>
          <styledEl.TabButton type="button" $active={tab === 'raw'} onClick={() => setTab('raw')}>
            Raw
          </styledEl.TabButton>
          <styledEl.TabButton type="button" $active={tab === 'parsed'} onClick={() => setTab('parsed')}>
            Parsed
          </styledEl.TabButton>
        </styledEl.Tabs>
        <styledEl.CopyButtonSlot>
          <CopyButton text={jsonData} />
        </styledEl.CopyButtonSlot>
      </styledEl.TopRow>
      <styledEl.JsonContent>{jsonData}</styledEl.JsonContent>
    </styledEl.JsonPanel>
  )
}
