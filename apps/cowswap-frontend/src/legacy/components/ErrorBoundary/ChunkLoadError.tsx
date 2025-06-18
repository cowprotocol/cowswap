import React, { useCallback } from 'react'

import cowNoConnectionIMG from '@cowprotocol/assets/cow-swap/cow-no-connection.png'
import { DISCORD_LINK } from '@cowprotocol/common-const'
import { ButtonPrimary, MEDIA_WIDTHS } from '@cowprotocol/ui'
import { AutoRow } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'

import { Title } from 'modules/application/pure/Page'

/**
 * We use the `cow-no-connection.png` image in case when there is no internet connection
 * Cause of it we must preload the image before lost of connection
 */
let cowNoConnectionIMGCache: string | null = null

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function preloadNoConnectionImg() {
  fetch(cowNoConnectionIMG)
    .then((res) => res.blob())
    .then((blob) => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)

      return new Promise<string>((resolve) => {
        reader.onload = function () {
          resolve(this.result as string)
        }
      })
    })
    .then((img) => {
      cowNoConnectionIMGCache = img
    })
}

preloadNoConnectionImg()

const StyledTitle = styled(Title)`
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    text-align: center;
  }
`

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0 0.5rem 0;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToMedium}px) {
    flex-direction: column;
    align-items: center;
  }
`

const LinkWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  padding: 6px 24px;
`

const NoConnectionContainer = styled.div`
  text-align: center;
`

const NoConnectionDesc = styled.div`
  text-align: left;
`

const NoConnectionImg = styled.img`
  max-width: 500px;
  display: inline-block;
  margin: 20px 0;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToMedium}px) {
    width: 90%;
  }
`

const AutoRowWithGap = styled(AutoRow)`
  gap: 16px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ChunkLoadError = () => {
  const reloadPage = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <>
      <FlexContainer>
        <StyledTitle>
          <Trans>This page can&apos;t be reached</Trans>
        </StyledTitle>
      </FlexContainer>
      <AutoColumn gap={'md'}>
        <NoConnectionContainer>
          <NoConnectionDesc>
            <p>Sorry, we were unable to load the requested page.</p>
            <p>
              This could have happened due to the lack of internet or the release of a new version of the application.
            </p>
          </NoConnectionDesc>
          {cowNoConnectionIMGCache && <NoConnectionImg src={cowNoConnectionIMGCache} alt="CowSwap no connection" />}
        </NoConnectionContainer>
        <AutoRowWithGap justify="center">
          <ButtonPrimary width="fit-content" onClick={reloadPage}>
            <Trans>Reload page</Trans>
          </ButtonPrimary>
          <LinkWrapper>
            <ExternalLink id="get-support-on-discord" href={DISCORD_LINK}>
              <ThemedText.Link fontSize={16}>
                <Trans>Get support on Discord</Trans>
                <span>↗</span>
              </ThemedText.Link>
            </ExternalLink>
          </LinkWrapper>
        </AutoRowWithGap>
      </AutoColumn>
    </>
  )
}
