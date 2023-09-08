import styled from 'styled-components/macro'

import { LightGreyCard } from 'legacy/components/Card'
import Column from 'legacy/components/Column'
import { RowFixed } from 'legacy/components/Row'
import { TagInfo } from 'legacy/state/lists/wrappedTokenInfo'

import { UI } from 'common/constants/theme'
import { StyledLogo } from 'common/pure/CurrencyLogo'

export const Tag = styled.div<{ tag?: TagInfo }>`
  display: flex;
  align-items: center;
  background: ${({ tag }) => (tag?.id === '0' ? `var(${UI.COLOR_DANGER_BG})` : tag?.id === '1' ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_GREY})`)};
  color: ${({ tag }) => (tag?.id === '0' ? `var(${UI.COLOR_DANGER_TEXT})` : tag?.id === '1' ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT1})`)};
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

export const Wrapper = styled.div`
  ${Column} {
    > div {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 220px;
      width: 100%;

      // Token symbol name
      &:first-of-type {
        color: var(${UI.COLOR_TEXT1});
      }

      // Token full name
      &:last-of-type {
        color: var(${UI.COLOR_TEXT2});
        font-weight: 400;
      }
      
      ${({ theme }) => theme.mediaWidth.upToSmall`
        max-width: 140px;
      `};
    }
  }
  ${StyledLogo} {
    height: 36px;
    width: 36px;
    border-radius: 36px;
  }
  ${TagLink} {
    color: var(${UI.COLOR_TEXT1});
  }
  ${LightGreyCard} {
    background: var(${UI.COLOR_CONTAINER_BG_01});
  }
  ${LightGreyCard} ${RowFixed} > div {
    color: var(${UI.COLOR_TEXT1});
  }
`
