import { font, InlineBanner, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Banner = styled(InlineBanner)`
  width: 100%;
  text-align: left;

  > span {
    justify-content: flex-start;
    align-items: flex-start;
    flex-flow: row nowrap;
    gap: 12px;
    width: 100%;
  }

  [role='group'] {
    padding: 0;
    width: auto;

    > button {
      ${font('FONT_SMALL_PLUS', 'medium')}
      flex: none;
      min-width: 60px;
      height: 36px;
      padding: 3px 7px;
      white-space: nowrap;

      ${Media.upToExtraSmall()} {
        ${font('FONT_SMALL_PLUS', 'medium')}
        padding: 3px 7px;
      }
    }

    > button:last-child {
      min-width: auto;
    }
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;
`

export const Title = styled.div`
  ${font('FONT_NORMAL', 'semibold')}
  color: var(${UI.COLOR_PRIMARY});
`

export const Description = styled.div`
  ${font('FONT_SMALL_PLUS')}
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TrendIcon = styled.div`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_PAPER});

  svg {
    width: 16px;
    height: 16px;
  }
`
