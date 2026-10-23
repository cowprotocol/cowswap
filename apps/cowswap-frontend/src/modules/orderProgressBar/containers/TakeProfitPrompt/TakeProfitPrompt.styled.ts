import { font, InlineBanner, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Banner = styled(InlineBanner)`
  width: 100%;
  text-align: left;

  > div > div:first-child {
    justify-content: flex-start;
    gap: 12px;
  }

  [role='group'] {
    padding: 0;
    flex-wrap: nowrap;

    > button {
      flex: 1;
      min-width: 0;
      height: 36px;
      padding: 3px 6px;
    }
  }
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
