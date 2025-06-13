import { useState } from 'react'

import { Color } from '@cowprotocol/ui'

import AppDataWrapper from 'components/common/AppDataWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import { Notification } from 'components/Notification'
import { useAppData } from 'hooks/useAppData'
import styled from 'styled-components/macro'

type Props = {
  appData: string
  fullAppData?: string
  showExpanded?: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
const DecodeAppData = (props: Props): React.ReactNode => {
  const { appData, showExpanded = false, fullAppData } = props
  const {
    isLoading: appDataLoading,
    appDataDoc: decodedAppData,
    ipfsUri,
    hasError: appDataError,
  } = useAppData(appData, fullAppData)

  const isLegacyAppDataHex = fullAppData === undefined
  const [showDecodedAppData, setShowDecodedAppData] = useState<boolean>(showExpanded)

  const renderAppData = (): React.ReactNode | null => {
    const appDataString = JSON.stringify(decodedAppData, null, 2)

    if (appDataLoading) return <Spinner />
    if (showDecodedAppData) {
      if (appDataError)
        return (
          <Notification
            type="error"
            message="Error when getting metadata info."
            closable={false}
            appendMessage={false}
          />
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
      <div className={`hidden-content ${appDataError && 'error'}`}>{renderAppData()}</div>
    </AppDataWrapper>
  )
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

export default DecodeAppData
