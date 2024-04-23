import { useFetchFile } from '@cowprotocol/common-hooks'
import { hashCode } from '@cowprotocol/common-utils'
import { environmentName } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { GlobalWarning, ClosableBanner } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactMarkdown, { Components } from 'react-markdown'

import { markdownComponents } from '../../Markdown/components'

// Announcement content: Modify this repository to edit the announcement
const ANNOUNCEMENTS_MARKDOWN_BASE_URL = 'https://raw.githubusercontent.com/cowprotocol/cowswap-banner/main'

const BANNER_STORAGE_KEY = 'announcementBannerClosed/'

const PRODUCTION_ENVS: (typeof environmentName)[] = ['production', 'staging', 'ens']

function getAnnouncementUrl(chainId: number, env?: 'production' | 'barn') {
  return `${ANNOUNCEMENTS_MARKDOWN_BASE_URL}${env ? `/${env}` : ''}/announcements-${chainId}.md`
}

function useGetAnnouncement(chainId: number): string | undefined {
  const env = PRODUCTION_ENVS.includes(environmentName) ? 'production' : 'barn'

  // Fetches global announcement
  const { file, error } = useFetchFile(getAnnouncementUrl(chainId))
  // Fetches env announcement
  const { file: envFile, error: envError } = useFetchFile(getAnnouncementUrl(chainId, env))

  const announcementText = error ? undefined : file?.trim()

  if (error) {
    console.error('[URLWarning] Error getting the announcement text: ', error)
  }

  const envAnnouncementText = envError ? undefined : envFile?.trim()

  if (envError) {
    console.error(`[URLWarning] Error getting the env ${env} announcement text: `, envError)
  }

  return announcementText || envAnnouncementText
}

export function URLWarning() {
  const { chainId = ChainId.MAINNET } = useWalletInfo()

  const announcementText = useGetAnnouncement(chainId)
  const contentHash = announcementText ? hashCode(announcementText).toString() : undefined

  if (!announcementText) {
    return null
  }

  return ClosableBanner(BANNER_STORAGE_KEY + contentHash, (close) => (
    <GlobalWarning onClose={close}>
      <ReactMarkdown components={markdownComponents as Components}>{announcementText}</ReactMarkdown>
    </GlobalWarning>
  ))
}
