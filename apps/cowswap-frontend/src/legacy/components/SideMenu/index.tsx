import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export function SideMenu({
  longList,
  children,
  className,
}: {
  longList?: boolean
  className?: string
  children: JSX.Element
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
  margin: 0 24px 0 0;
  color: inherit;
  height: max-content;
  position: sticky;
  top: 0;
  width: 100%;
  padding: 38px 0 0;

  ${({ theme, longList }) => theme.mediaWidth[longList ? 'upToMedium' : 'upToSmall']`
    padding: 0;
    margin: 0;
    position: relative;
  `}

  > div {
    height: 90vh;
    overflow-y: auto;
    margin-right: 5px;
    ${({ theme }) => theme.colorScrollbar};

    ${({ theme, longList }) => theme.mediaWidth[longList ? 'upToMedium' : 'upToSmall']`
      height: auto;
    `}
  }

  > div > ul {
    display: flex;
    flex-flow: column wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: inherit;

    ${({ theme, longList }) => theme.mediaWidth[longList ? 'upToMedium' : 'upToSmall']`
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
    padding: 12px;
    margin: 0 0 24px;
    `}

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

        ${({ theme, longList }) => theme.mediaWidth[longList ? 'upToMedium' : 'upToSmall']`
          margin: 0;
        `}

        &:hover,
        &.active {
          opacity: 1;
        }

        &.active {
          font-weight: 600;

          ${({ theme, longList }) => theme.mediaWidth[longList ? 'upToMedium' : 'upToSmall']`
            background: var(${UI.COLOR_TEXT_OPACITY_10});
            border-radius: 16px;
          `}
        }
      }
    }
  }
`
