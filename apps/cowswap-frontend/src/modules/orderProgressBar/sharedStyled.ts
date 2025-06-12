import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Description = styled.div<{ center?: boolean; margin?: string }>`
  margin: ${({ margin }) => margin || '8px 0 0'};
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: ${({ center }) => (center ? 'center' : 'left')};

  > button,
  > a {
    text-decoration: underline;
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`

export const ProgressImageWrapper = styled.div<{ bgColor?: string; padding?: string; height?: string; gap?: string }>`
  width: 100%;
  height: ${({ height }) => height || '246px'};
  min-height: 200px;
  max-height: ${({ height }) => height || '246px'};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px;
  padding: ${({ padding }) => padding || '0'};
  gap: ${({ gap }) => gap || '0'};
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  transition: height 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

  ${Media.upToSmall()} {
    height: auto;
  }

  > img,
  > svg {
    --size: 100%;
    max-width: var(--size);
    max-height: var(--size);
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    padding: 0;
    margin: 0;
  }

  > div {
    display: flex;
  }
`
