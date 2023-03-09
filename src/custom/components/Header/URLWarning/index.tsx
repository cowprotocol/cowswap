import styled from 'styled-components/macro'
import { RAW_CODE_LINK } from 'constants/index'
import { AlertTriangle } from 'react-feather'
import URLWarningUni, { PhishAlert, StyledClose } from './URLWarningMod'
import { useAnnouncementVisible, useCloseAnnouncement } from 'state/profile/hooks'
import { hashCode } from 'utils/misc'
import useFetchFile from 'hooks/useFetchFile'
import { Markdown } from 'components/Markdown'

import { SupportedChainId as ChainId } from 'constants/chains'
import { useWalletInfo } from '@cow/modules/wallet'

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
const ANNOUNCEMENTS_MARKDOWN_BASE_URL = RAW_CODE_LINK + '/configuration/config/announcements'

function getAnnouncementUrl(chainId: number) {
  return `${ANNOUNCEMENTS_MARKDOWN_BASE_URL}/announcements-${chainId}.md`
}

export default function URLWarning() {
  const { chainId = ChainId.MAINNET } = useWalletInfo()

  // Ger announcement if there's one
  const { file, error } = useFetchFile(getAnnouncementUrl(chainId))
  const announcementText = error ? undefined : file?.trim()
  const contentHash = announcementText ? hashCode(announcementText).toString() : undefined

  if (error) {
    console.error('[URLWarning] Error getting the announcement text: ', error)
  } else {
    console.debug('[URLWarning] Announcement text', announcementText, contentHash)
  }

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
