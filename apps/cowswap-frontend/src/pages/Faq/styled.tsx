import { ButtonPrimary } from '@cowprotocol/ui'
import { ExternalLink as ExternalLinkTheme } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { StyledInternalLink } from 'legacy/theme'

import { Content } from 'modules/application/pure/Page'

import { UI } from 'common/constants/theme'

export const ExternalLinkFaq = styled(ExternalLinkTheme)`
  text-decoration: underline;
  font-weight: normal;
`

export const InternalLinkFaq = styled(StyledInternalLink)`
  text-decoration: underline;
  font-weight: normal;
`

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 160px auto;
  flex-direction: column;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    display: flex;
    flex-flow: column wrap;
  `}

  #table-container {
    margin: auto;
    max-width: 100%;

    > table {
      width: 100%;
      border-spacing: 1px;
      color: var(${UI.COLOR_TEXT1});

      > thead {
        background: ${({ theme }) => theme.bg3};
      }

      > tbody > tr {
        background: var(${UI.COLOR_GREY});
      }

      > tbody > tr > td > span[role='img'] {
        font-size: 18px;
      }

      th,
      td {
        text-align: left;
        padding: 6px 12px;

        &:not(:first-child) {
          text-align: center;
        }
      }

      th {
        padding: 16px 12px;
      }
    }
  }

  > div:not(:first-child) {
    margin: 2rem 0;
  }

  ${Content} {
    > div > ul {
      margin: 12px 0 24px;
      padding: 0 0 0 20px;
      color: ${({ theme }) => theme.text3};
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

export const FooterWrapper = styled.div`
  display: block;
  margin: 34px 0 0;
  padding: 14px 0 0;
  border-top: 1px solid ${({ theme }) => theme.text1};
`

export const PageIndex = styled.div`
  display: flex;
  flex-flow: column wrap;
  border-bottom: 1px solid ${({ theme }) => theme.text1};
`

export const ButtonNav = styled(ButtonPrimary)`
  width: min-content;
  white-space: nowrap;
`

export const Menu = styled.div`
  display: flex;
  flex-flow: column wrap;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  margin: 0 24px 0 0;
  color: var(${UI.COLOR_TEXT1});
  height: max-content;
  position: sticky;
  top: 0;
  width: 100%;
  padding: 38px 0 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0;
    position: relative;
    margin: 0;
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
