import styled from 'styled-components/macro'
import { Content } from 'components/Page'
import { PageWrapper } from 'components/Page'
import { ThemedText, MEDIA_WIDTHS } from 'theme'

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 160px auto;
  flex-direction: column;

  margin: 0 1rem;
  max-width: ${MEDIA_WIDTHS.upToLarge}px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    max-width: ${MEDIA_WIDTHS.upToMedium}px;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: ${MEDIA_WIDTHS.upToSmall}px;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: ${MEDIA_WIDTHS.upToExtraSmall}px;
    display: flex;
    flex-flow: column wrap;
  `}

  h2 {
    color: ${({ theme }) => theme.primary1};
  }

  > div:not(:first-child) {
    margin: 2rem 0;
  }

  ${Content} {
    > div > ul {
      margin: 12px 0 24px;
      padding: 0 0 0 20px;
      color: ${({ theme }) => theme.primary1};
      line-height: 1.2;
    }

    > div > ul > li {
      margin: 0 0 12px;
    }

    > h3 {
      margin: 0;

      ::before {
        border-top: none;
      }
    }
  }

  ol > li {
    margin-bottom: 0.5rem;
  }
`

export const AccountPageWrapper = styled(PageWrapper)`
  width: 100%;
  max-width: 100%;
  border: none;
  background: none;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0;
    padding: 0;
    margin-top: 1rem;
  `};
`

export const Subtitle = styled(ThemedText.MediumHeader)`
  padding-bottom: 1rem;
`
