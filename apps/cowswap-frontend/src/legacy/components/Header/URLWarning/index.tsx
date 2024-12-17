import { hashCode, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { ClosableBanner } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactMarkdown, { Components } from 'react-markdown'

import { useCriticalAnnouncements, useNonCriticalAnnouncements } from 'common/hooks/useAnnouncements'
import { GlobalWarning } from 'common/pure/GlobalWarning'

import { markdownComponents } from '../../Markdown/components'


const BANNER_STORAGE_KEY = 'announcementBannerClosed/'


function useGetCmsAnnouncement(chainId: number): string | undefined {
  const critical = useCriticalAnnouncements(chainId)
  const nonCritical = useNonCriticalAnnouncements(chainId)

  const isWidget = isInjectedWidget()

  // Critical takes priority
  if (critical.length) {
    // Assume only one announcement can be displayed for now
    return critical[0].text
  } else if (!isWidget && nonCritical.length) {
    // Non-critical can only be displayed when not in the widget
    return nonCritical[0].text
  }

  return
}

export function URLWarning() {
  const { chainId = ChainId.MAINNET } = useWalletInfo()

  const announcementText = useGetCmsAnnouncement(chainId)
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
