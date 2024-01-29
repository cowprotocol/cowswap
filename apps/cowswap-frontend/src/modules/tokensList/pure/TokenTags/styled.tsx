import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-flow: row wrap;
  color: inherit;
  flex: 0 1 auto;
  gap: 4px;
  margin: 0 0 0 auto;
`

export const Tag = styled.div<{ tag?: { id: string } }>`
  display: flex;
  align-items: center;
  background: ${({ tag }) =>
    tag?.id === '0'
      ? `var(${UI.COLOR_DANGER_BG})`
      : tag?.id === '1'
      ? `var(${UI.COLOR_SUCCESS_BG})`
      : `var(${UI.COLOR_PAPER_DARKER})`};
  color: ${({ tag }) =>
    tag?.id === '0'
      ? `var(${UI.COLOR_DANGER_TEXT})`
      : tag?.id === '1'
      ? `var(${UI.COLOR_SUCCESS_TEXT})`
      : `var(${UI.COLOR_TEXT})`};
  font-size: 12px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  border-radius: 4px;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin: 0 4px 0 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}

  > img,
  > svg {
    --size: 12px;
    display: inline-block;
    margin: 0 5px 0 0;
    width: var(--size);
    height: var(--size);
  }

  > svg > path {
    fill: currentColor;
  }
`

export const TagLink = styled(Tag)`
  color: inherit;

  a {
    color: inherit;
    font-weight: inherit;
  }
`
