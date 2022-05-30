import styled from 'styled-components/macro'
import { Content } from 'components/Page'
import { transparentize } from 'polished'
import { PageWrapper } from 'components/Page'
import { MEDIA_WIDTHS } from '@src/theme'

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

export const Menu = styled.div`
  display: flex;
  flex-flow: column wrap;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  margin: 0 24px 0 0;
  color: ${({ theme }) => theme.text1};
  height: max-content;
  position: sticky;
  top: 0;
  width: 100%;
  padding: 38px 0 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0;
    position: relative;
  `}

  > ul {
    display: flex;
    flex-flow: column wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: inherit;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      background: ${({ theme }) => transparentize(0.9, theme.text1)};
      border-radius: 16px;
      padding: 12px;
    `}
  }

  > ul > li {
    width: 100%;
  }

  > ul > li > a {
    margin: 4px 0;
    padding: 12px;
    border-radius: 6px;
    width: 100%;
    text-decoration: none;
    color: inherit;
    opacity: 0.65;
    transition: opacity 0.2s ease-in-out;
    display: block;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0;
    `}

    &:hover,
    &.active {
      opacity: 1;
    }

    &.active {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        background: ${({ theme }) => transparentize(0.9, theme.text1)};
        border-radius: 16px;
      `}
    }
  }
`

export const AccountPageWrapper = styled(PageWrapper)`
  width: 100%;
  max-width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 0;
  `};
`
