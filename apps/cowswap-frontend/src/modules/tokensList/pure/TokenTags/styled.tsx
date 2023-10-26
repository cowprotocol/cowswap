import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-flow: row wrap;
`

export const Tag = styled.div<{ tag?: { id: string } }>`
  display: flex;
  align-items: center;
  background: ${({ tag }) =>
    tag?.id === '0'
      ? `var(${UI.COLOR_DANGER_BG})`
      : tag?.id === '1'
      ? `var(${UI.COLOR_SUCCESS_BG})`
      : `var(${UI.COLOR_GREY})`};
  color: ${({ tag }) =>
    tag?.id === '0'
      ? `var(${UI.COLOR_DANGER_TEXT})`
      : tag?.id === '1'
      ? `var(${UI.COLOR_SUCCESS_TEXT})`
      : `var(${UI.COLOR_TEXT1})`};
  font-size: 12px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  border-radius: 4px;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin: 0 4px 0 0;

  > img {
    --size: 14px;
    display: inline-block;
    margin: 0 5px 0 0;
    width: var(--size);
    height: var(--size);
  }
`

export const TagLink = styled(Tag)`
  a {
    color: inherit;
    font-weight: inherit;
  }
`
