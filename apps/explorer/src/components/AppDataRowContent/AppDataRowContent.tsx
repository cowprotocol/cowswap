import { ReactNode, useState } from 'react'

import { AppDataWrapper } from 'components/common/AppDataWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { useAppData } from 'hooks/useAppData'

import * as styledEl from './AppDataRowContent.styles'

import { AppDataContent } from '../AppData/AppDataContent'

interface AppDataRowContentProps {
  appData: string
  fullAppData?: string
  showExpanded?: boolean
}

const EMPTY_APP_DATA = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function AppDataRowContent({ appData, showExpanded = false, fullAppData }: AppDataRowContentProps): ReactNode {
  const { ipfsUri, hasError: appDataError } = useAppData(appData, fullAppData)

  const isLegacyAppDataHex = fullAppData === undefined
  const hasAppData = appData.trim() !== EMPTY_APP_DATA
  const [showDecodedAppData, setShowDecodedAppData] = useState<boolean>(showExpanded)

  return (
    <AppDataWrapper>
      <>
        {appDataError ? (
          <span className="app-data">{appData}</span>
        ) : isLegacyAppDataHex ? (
          <RowWithCopyButton
            textToCopy={ipfsUri || ''}
            contentsToDisplay={
              <a href={ipfsUri} target="_blank" rel="noopener noreferrer">
                {appData}
              </a>
            }
          />
        ) : (
          // TODO: Remove this, and leave just the LINK after the backend uploads the IPFS documents
          //  https://cowservices.slack.com/archives/C0375NV72SC/p1689618027267289
          appData
        )}
        &nbsp;
        {hasAppData && (
          <styledEl.ShowMoreButton onClick={() => setShowDecodedAppData((state) => !state)}>
            {showDecodedAppData ? '[-] Show less' : '[+] Show more'}
          </styledEl.ShowMoreButton>
        )}
      </>
      <div className={`hidden-content ${appDataError && 'error'}`}>
        <AppDataContent appData={appData} fullAppData={fullAppData} showDecodedAppData={showDecodedAppData} />
      </div>
    </AppDataWrapper>
  )
}
