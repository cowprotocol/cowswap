import { ReactNode, useState } from 'react'

import { Color } from '@cowprotocol/ui'

import AppDataWrapper from 'components/common/AppDataWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { useAppData } from 'hooks/useAppData'
import styled from 'styled-components/macro'

import { AppDataContent } from './AppDataContent'

type DecodeAppDataProps = {
  appData: string
  fullAppData?: string
  showExpanded?: boolean
}

const ShowMoreButton = styled.button`
  font-size: 1.4rem;
  margin-top: 0.5rem;
  border: none;
  background: none;
  color: ${Color.explorer_textActive};
  align-self: flex-start;
  padding: 0;

  :hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

export const DecodeAppData = (props: DecodeAppDataProps): ReactNode => {
  const { appData, showExpanded = false, fullAppData } = props
  const { ipfsUri, hasError: appDataError } = useAppData(appData, fullAppData)

  const isLegacyAppDataHex = fullAppData === undefined
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
        <ShowMoreButton onClick={() => setShowDecodedAppData((state) => !state)}>
          {showDecodedAppData ? '[-] Show less' : '[+] Show more'}
        </ShowMoreButton>
      </>
      <div className={`hidden-content ${appDataError && 'error'}`}>
        <AppDataContent appData={appData} fullAppData={fullAppData} showDecodedAppData={showDecodedAppData} />
      </div>
    </AppDataWrapper>
  )
}
