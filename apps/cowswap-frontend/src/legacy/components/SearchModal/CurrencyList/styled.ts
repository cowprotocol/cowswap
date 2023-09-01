import styled from 'styled-components/macro'


import { LightGreyCard } from 'legacy/components/Card'
import Column from 'legacy/components/Column'
import { RowFixed } from 'legacy/components/Row'
import { TagInfo } from 'legacy/state/lists/wrappedTokenInfo'

import { StyledLogo } from 'common/pure/CurrencyLogo'

export const Tag = styled.div<{ tag?: TagInfo }>`
  display: flex;
  align-items: center;
  background: ${({ tag }) => (tag?.id === '0' ? 'var(--cow-color-danger-bg)' : tag?.id === '1' ? 'var(--cow-color-success-bg)' : 'var(--cow-color-grey)')};
  color: ${({ tag }) => (tag?.id === '0' ? 'var(--cow-color-danger-text)' : tag?.id === '1' ? 'var(--cow-color-success-text)' : 'var(--cow-color-text1)')};
  font-size: 12px;
  font-weight: var(--cow-font-weight-medium);
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
        color: ${({ theme }) => theme.text1};
      }

      // Token full name
      &:last-of-type {
        color: ${({ theme }) => theme.text2};
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
    color: ${({ theme }) => theme.text1};
  }

  ${LightGreyCard} {
    background: ${({ theme }) => theme.bg1};
  }

  ${LightGreyCard} ${RowFixed} > div {
    color: ${({ theme }) => theme.text1};
  }
`
