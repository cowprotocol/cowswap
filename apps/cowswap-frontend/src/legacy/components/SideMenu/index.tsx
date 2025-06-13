import { ReactElement } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SideMenu({
  longList,
  children,
  className,
}: {
  longList?: boolean
  className?: string
  children: ReactElement
}) {
  return (
    <Wrapper longList={longList} className={className}>
      <div>{children}</div>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ longList?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  margin: 0;
  color: inherit;
  height: max-content;
  position: sticky;
  top: 0;
  width: 100%;
  padding: 84px 0 0;

  ${({ longList }) => (longList ? Media.upToMedium : Media.upToSmall)()} {
    padding: 0;
    margin: 0;
    position: relative;
  }

  > div {
    height: 90vh;
    overflow-y: auto;
    margin-right: 5px;
    ${({ theme }) => theme.colorScrollbar};

    ${({ longList }) => (longList ? Media.upToMedium : Media.upToSmall)()} {
      height: auto;
    }
  }

  > div > ul {
    display: flex;
    flex-flow: column wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: inherit;

    ${({ longList }) => (longList ? Media.upToMedium : Media.upToSmall)()} {
      background: var(${UI.COLOR_TEXT_OPACITY_10});
      border-radius: 16px;
      padding: 12px;
      margin: 0 0 24px;
    }

    > li {
      width: 100%;

      > a {
        margin: 4px 0;
        padding: 12px;
        border-radius: 6px;
        width: 100%;
        text-decoration: none;
        color: inherit;
        opacity: 0.65;
        transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
        display: block;

        ${({ longList }) => (longList ? Media.upToMedium : Media.upToSmall)()} {
          margin: 0;
        }

        &:hover,
        &.active {
          opacity: 1;
        }

        &.active {
          font-weight: 600;

          ${({ longList }) => (longList ? Media.upToMedium : Media.upToSmall)()} {
            background: var(${UI.COLOR_TEXT_OPACITY_10});
            border-radius: 16px;
          }
        }
      }
    }
  }
`
