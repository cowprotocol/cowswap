import { ReactNode, useState } from 'react'

import { AppDataWrapper } from 'components/common/AppDataWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { ShowMoreButton } from 'components/common/ShowMoreButton'
import { useAppData } from 'hooks/useAppData'
import styled from 'styled-components/macro'

import { AppDataContent } from '../AppData/AppDataContent'

interface AppDataRowContentProps {
  appData: string
  fullAppData?: string
  showExpanded?: boolean
}

const EMPTY_APP_DATA = '0x0000000000000000000000000000000000000000000000000000000000000000'

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  > span {
    min-width: 0;
    max-width: 100%;
  }
`

export function AppDataRowContent({ appData, showExpanded = false, fullAppData }: AppDataRowContentProps): ReactNode {
  const { ipfsUri, hasError: appDataError } = useAppData(appData, fullAppData)

  const hasAppData = appData.trim() !== EMPTY_APP_DATA
  const [showDecodedAppData, setShowDecodedAppData] = useState<boolean>(showExpanded)

  return (
    <AppDataWrapper>
      <Header>
        <RowWithCopyButton textToCopy={appData} contentsToDisplay={appData} />
        {hasAppData && (
          <ShowMoreButton onClick={() => setShowDecodedAppData((state) => !state)}>
            {showDecodedAppData ? '[-] Show less' : '[+] Show more'}
          </ShowMoreButton>
        )}
        {ipfsUri && !appDataError && (
          <a href={ipfsUri} target="_blank" rel="noopener noreferrer">
            IPFS↗
          </a>
        )}
      </Header>
      <div className={`hidden-content ${appDataError && 'error'}`}>
        <AppDataContent appData={appData} fullAppData={fullAppData} showDecodedAppData={showDecodedAppData} />
      </div>
    </AppDataWrapper>
  )
}
