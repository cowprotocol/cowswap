import { StatusColorEnums, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TagContainer = styled.div`
  display: inline-flex;
  flex-flow: row wrap;
  color: inherit;
  gap: 4px;
  align-items: center;
`

export const Tag = styled.div<{ tag?: { id: string }; colorEnums: StatusColorEnums }>`
  display: flex;
  align-items: center;
  background: var(${({ colorEnums }) => colorEnums.bg});
  color: var(${({ colorEnums }) => colorEnums.text});
  font-size: 11px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  border-radius: 12px;
  padding: 3px 6px;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${Media.upToSmall()} {
    margin: 0;
  }

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
