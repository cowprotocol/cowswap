import { PropsWithChildren } from 'react'

import { UI } from '@cowprotocol/ui'

import { lighten } from 'color2k'
import styled, { css } from 'styled-components/macro'

import { WithClassName } from 'legacy/types'

import { Widget } from 'modules/application/pure/Widget'

export const PageWrapper = styled(Widget)`
  padding: 0 24px 24px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.content};
  min-height: 500px;
`

export const Title = styled.h1`
  font-size: 32px;
  margin: 24px 0;
  color: inherit;
  text-shadow: ${({ theme }) => theme.textShadow1};
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 24px;
  `}
`

export const SectionTitle = styled(Title)`
  font-size: 21px;
  margin: 12px 0 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
  `}
`

export const Content = styled.div`
  font-size: 16px;
  margin: 0 0 28px;
  display: block;
  color: inherit;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    p > a {
      word-break: break-all;
    }
  `}

  > h2 {
    font-size: 24px;
    margin: 24px 0 16px;
  }

  > h2 > b {
    color: inherit;
  }

  > h3 {
    font-size: 18px;
    margin: 24px 0;
  }

  > h3::before {
    content: '';
    display: block;
    border-top: 1px solid ${({ theme }) => theme.grey1};
    margin: 34px 0;
    opacity: 0.2;
  }

  /* underlined subheader */
  > h4 {
    text-decoration: underline;
    font-weight: normal;
  }

  > p {
    line-height: 1.6;
  }

  > p > img {
    width: 100%;
    height: auto;
    margin: 24px auto;
  }

  > p em,
  p em {
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

export const BackToTopStyle = css`
  #back-to-top {
    border: 1px solid transparent;
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
    font-size: 18px;
    font-weight: 600;
    border: none;
    box-shadow: none;
    border-radius: 16px;
    position: relative;
    min-height: 58px;
    padding: 16px;
    transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
    cursor: pointer;

    &:focus,
    &:hover,
    &:active {
      box-shadow: none;
      transform: none;
      color: ${({ theme }) => theme.white};
    }

    &:hover {
      background: ${({ theme }) => lighten(theme.bg2, 0.08)};
    }
  }
`

export const GdocsListStyle = css`
  /* List styles */
  ${BackToTopStyle}

  > ul,
  ol {
    margin: 24px 0;
    padding: 12px 48px;
    background: var(${UI.COLOR_PAPER_DARKER});
    border-radius: 12px;

    > li {
      /* Match 1st level list styles from G Docs */
      margin: 0 0 10px;
      list-style: decimal;

      a {
        color: ${({ theme }) => theme.text3};

        &:hover {
          color: ${({ theme }) => theme.text3};
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

export function Page(props: PageProps) {
  return <PageWrapper className={props?.className}>{props?.children}</PageWrapper>
}
