import React, { PropsWithChildren } from 'react'

import styled, { css } from 'styled-components'
import AppBody from 'pages/AppBody'
import { WithClassName } from 'types'

export const PageWrapper = styled(AppBody)`
  padding: 0 24px 24px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.content};
  min-height: 500px;
`

export const Title = styled.h1`
  font-size: 32px;
  margin: 24px 0 16px;
`

export const Content = styled.div`
  font-size: 15px;
  margin: 0 0 28px;
  display: block;

  > h2 {
    font-size: 24px;
    margin: 24px 0 16px;
  }

  > h2 > b {
    color: ${({ theme }) => theme.primary1};
  }

  > h3 {
    font-size: 18px;
    margin: 24px 0;
  }

  > h3::before {
    content: '';
    display: block;
    border-top: 1px solid ${({ theme }) => theme.border};
    margin: 34px 0;
    opacity: 0.2;
  }

  /* underlined subheader */
  > h4 {
    text-decoration: underline;
    font-weight: normal;
  }

  > p {
    line-height: 1.5;
  }

  > p > img {
    width: 100%;
    height: auto;
    margin: 24px auto;
  }

  > p em {
    color: ${({ theme }) => theme.white};
    position: relative;
    width: 100%;
    display: flex;
    z-index: 0;
    padding: 12px;
    font-style: normal;
    font-size: 14px;
    line-height: 1.8;
    text-transform: uppercase;

    &::before {
      content: '';
      background: ${({ theme }) => theme.redShade};
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
      border-radius: 3px;
      top: 0;
      left: 0;
    }
  }

  li > em {
    background: ${({ theme }) => theme.redShade};
    color: ${({ theme }) => theme.white};
    width: 100%;
    display: block;
    padding: 6px 12px;
    line-height: 1.6;
  }

  a {
    color: ${({ theme }) => theme.text1};
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.textLink};
    }
  }

  ol > ol {
    margin: 0 0 24px;
  }

  ol > ol > li {
    margin: 0 0 12px;
  }

  ol > li {
    margin: 0 0 12px;
    display: list-item;
  }
`

export const GdocsListStyle = css`
  /* List styles */
  > ul,
  ol {
    margin: 24px 0;
    padding: 12px 24px 12px 38px;
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.text2};
    border-radius: 12px;

    > li {
      /* Match 1st level list styles from G Docs */
      margin: 0 0 10px;
      list-style: decimal;

      a {
        color: ${({ theme }) => theme.text2};

        &:hover {
          color: ${({ theme }) => theme.primary1};
        }
      }

      > ul,
      > ol {
        > li {
          /* Match 2nd level list styles from G Docs */
          list-style: lower-alpha;
        }

        > h4:last-child {
          /* CSS hack to allow nested subheaders to be aligned */
          /* while keeping sequential lower roman bullets */
          margin-left: -2.4rem;
        }
      }
    }
  }
`

export type PageProps = PropsWithChildren<WithClassName>

export default function Page(props: PageProps) {
  return <PageWrapper className={props?.className}>{props?.children}</PageWrapper>
}
