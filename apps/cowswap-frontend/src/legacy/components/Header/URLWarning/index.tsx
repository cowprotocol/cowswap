import { useCallback } from 'react'

import { hashCode, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { ClosableBanner } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactMarkdown, { Components } from 'react-markdown'

import { BANNER_IDS } from 'common/constants/banners'
import { useCriticalAnnouncements, useNonCriticalAnnouncements } from 'common/hooks/useAnnouncements'
import { GlobalWarning } from 'common/pure/GlobalWarning'

import { H2, LinkScrollableStyled, Table } from '../../Markdown/components'

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

const markdownComponents = { table: Table, h2: H2, a: LinkScrollableStyled }

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function URLWarning() {
  const { chainId = ChainId.MAINNET } = useWalletInfo()

  const announcementText = useGetCmsAnnouncement(chainId)
  const contentHash = announcementText ? hashCode(announcementText).toString() : undefined

  const callback = useCallback(
    (close: () => void) => (
      <GlobalWarning onClose={close}>
        <ReactMarkdown components={markdownComponents as Components}>{announcementText}</ReactMarkdown>
      </GlobalWarning>
    ),
    [announcementText],
  )

  if (!announcementText) {
    return null
  }

  return <ClosableBanner storageKey={BANNER_IDS.ANNOUNCEMENT + contentHash} callback={callback} />
}
