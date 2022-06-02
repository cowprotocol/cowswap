import { ExternalLink as ExternalLinkTheme } from 'theme'
import styled from 'styled-components/macro'
import { Content } from 'components/Page'
import { ButtonPrimary } from 'components/Button'

export const ExternalLinkFaq = styled(ExternalLinkTheme)`
  color: ${({ theme }) => theme.text1};
  text-decoration: underline;
  font-weight: normal;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.textLink};
  }
`

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 160px auto;
  flex-direction: column;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
  `}

  #table-container {
    margin: auto;
    max-width: 100%;

    > table {
      width: 100%;
      border-spacing: 1px;
      color: ${({ theme }) => theme.text1};

      > thead {
        background: ${({ theme }) => theme.tableHeadBG};
      }

      > tbody > tr {
        background: ${({ theme }) => theme.tableRowBG};
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
