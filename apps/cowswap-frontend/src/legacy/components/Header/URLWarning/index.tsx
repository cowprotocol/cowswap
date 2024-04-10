import { useFetchFile } from '@cowprotocol/common-hooks'
import { hashCode } from '@cowprotocol/common-utils'
import { environmentName } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { ClosableBanner, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { AlertTriangle } from 'react-feather'
import ReactMarkdown, { Components } from 'react-markdown'
import styled from 'styled-components/macro'

import URLWarningUni, { PhishAlert, StyledClose } from './URLWarningMod'

import { markdownComponents } from '../../Markdown/components'

export * from './URLWarningMod'

const Wrapper = styled.div`
  width: 100%;
  z-index: 1;
  ${PhishAlert} {
    justify-content: center;
    font-size: 12px;
    padding: 8px;
    background-color: var(${UI.COLOR_PRIMARY});
    color: ${({ theme }) => theme.white};

    > div {
      align-items: center;
      width: 100%;
    }

    > div > svg {
      min-width: 24px;
    }

    > div > p {
      padding: 0 12px;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        padding: 12px;
      `};
    }
  }

  ${StyledClose} {
    height: 100%;
    width: 24px;
    margin: 0;
    color: inherit;
    stroke: currentColor;
  }
`

// Announcement content: Modify this repository to edit the announcement
const ANNOUNCEMENTS_MARKDOWN_BASE_URL = 'https://raw.githubusercontent.com/cowprotocol/cowswap-banner/main'

function getAnnouncementUrl(chainId: number, env?: 'production' | 'barn') {
  return `${ANNOUNCEMENTS_MARKDOWN_BASE_URL}${env ? `/${env}` : ''}/announcements-${chainId}.md`
}

const PRODUCTION_ENVS: (typeof environmentName)[] = ['production', 'staging', 'ens']

function useGetAnnouncement(chainId: number): string | undefined {
  const env = PRODUCTION_ENVS.includes(environmentName) ? 'production' : 'barn'

  // Fetches global announcement
  const { file, error } = useFetchFile(getAnnouncementUrl(chainId))
  // Fetches env announcement
  const { file: envFile, error: envError } = useFetchFile(getAnnouncementUrl(chainId, env))

  const announcementText = error ? undefined : file?.trim()

  if (error) {
    console.error('[URLWarning] Error getting the announcement text: ', error)
  } else {
    console.debug('[URLWarning] Announcement text', announcementText)
  }

  const envAnnouncementText = envError ? undefined : envFile?.trim()

  if (envError) {
    console.error(`[URLWarning] Error getting the env ${env} announcement text: `, envError)
  } else {
    console.debug(`[URLWarning] Env ${env} announcement text`, envAnnouncementText)
  }

  return announcementText || envAnnouncementText
}

function Markdown(props: { children?: string }) {
  const { children = '' } = props
  return <ReactMarkdown components={markdownComponents as Components}>{children}</ReactMarkdown>
}

const BANNER_STORAGE_KEY = 'announcementBannerClosed/'

export default function URLWarning() {
  const { chainId = ChainId.MAINNET } = useWalletInfo()

  // Ger announcement if there's one
  const announcementText = useGetAnnouncement(chainId)
  const contentHash = announcementText ? hashCode(announcementText).toString() : undefined

  if (!announcementText) {
    return null
  }

  return ClosableBanner(BANNER_STORAGE_KEY + contentHash, (close) => (
    <Wrapper>
      <URLWarningUni
        announcement={
          <>
            <div style={{ display: 'flex' }}>
              <AlertTriangle /> <Markdown>{announcementText}</Markdown>
            </div>
            <StyledClose size={12} onClick={close} />
          </>
        }
      />
    </Wrapper>
  ))
}
