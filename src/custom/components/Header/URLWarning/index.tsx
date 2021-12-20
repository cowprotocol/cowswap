import styled from 'styled-components/macro'
import { BARN_URL, PRODUCTION_URL } from 'constants/index'
import { AlertTriangle } from 'react-feather'
import URLWarningUni, { PhishAlert, StyledClose } from './URLWarningMod'
import { useAnnouncementVisible, useCloseAnnouncement } from 'state/profile/hooks'
import { hashCode } from 'utils/misc'
import useFetchFile from 'hooks/useFetchFile'
import { Markdown } from 'components/Markdown'
import { useActiveWeb3React } from '@src/hooks/web3'
import { ChainId } from '@uniswap/sdk'
import { isBarn } from 'utils/environments'

export * from './URLWarningMod'

const Wrapper = styled.div`
  width: 100%;
  z-index: 1;
  ${PhishAlert} {
    justify-content: center;
    font-size: 12px;
    padding: 8px;
    background-color: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.text2};

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
//  https://github.com/gnosis/cowswap/blob/configuration/docs/announcements.md
const ANNOUNCEMENTS_MARKDOWN_BASE_URL = 'https://raw.githubusercontent.com/gnosis/cowswap/configuration/announcements'

function getAnnouncementUrl(chainId: number) {
  return `${ANNOUNCEMENTS_MARKDOWN_BASE_URL}/announcements-${chainId}.md`
}

const WARNING_URL = isBarn ? BARN_URL : PRODUCTION_URL

export default function URLWarning() {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()

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
      <URLWarningUni url={WARNING_URL} announcement={announcement} />
    </Wrapper>
  )
}
