import styled from 'styled-components/macro'
import { RAW_CODE_LINK } from 'constants/index'
import { AlertTriangle } from 'react-feather'
import URLWarningUni, { PhishAlert, StyledClose } from './URLWarningMod'
import { useAnnouncementVisible, useCloseAnnouncement } from 'state/profile/hooks'
import { hashCode } from 'utils/misc'
import useFetchFile from 'hooks/useFetchFile'
import { Markdown } from 'components/Markdown'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cow/modules/wallet'
import { environmentName } from 'utils/environments'

export * from './URLWarningMod'

const Wrapper = styled.div`
  width: 100%;
  z-index: 1;
  ${PhishAlert} {
    justify-content: center;
    font-size: 12px;
    padding: 8px;
    background-color: ${({ theme }) => theme.bg2};
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
  }
`

// Announcement content: Modify this file to edit the announcement
//  https://github.com/gnosis/cowswap/blob/configuration/config/announcements/announcements.md
const ANNOUNCEMENTS_MARKDOWN_BASE_URL = RAW_CODE_LINK + '/configuration/config'

function getAnnouncementUrl(chainId: number, env?: 'production' | 'barn') {
  return `${ANNOUNCEMENTS_MARKDOWN_BASE_URL}${env ? `/${env}` : ''}/announcements/announcements-${chainId}.md`
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

export default function URLWarning() {
  const { chainId = ChainId.MAINNET } = useWalletInfo()

  // Ger announcement if there's one
  const announcementText = useGetAnnouncement(chainId)
  const contentHash = announcementText ? hashCode(announcementText).toString() : undefined

  const announcementVisible = useAnnouncementVisible(contentHash)
  const closeAnnouncement = useCloseAnnouncement()

  const announcement = announcementVisible && announcementText && (
    <>
      <div style={{ display: 'flex' }}>
        <AlertTriangle /> <Markdown>{announcementText}</Markdown>
      </div>
      <StyledClose size={12} onClick={() => closeAnnouncement(contentHash)} />
    </>
  )

  return (
    <Wrapper>
      <URLWarningUni announcement={announcement} />
    </Wrapper>
  )
}
