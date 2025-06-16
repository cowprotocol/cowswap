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
  height: var(--progress-top-section-height, 246px);
  min-height: var(--progress-top-section-height, 246px);
  max-height: var(--progress-top-section-height, 246px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px;
  padding: ${({ padding }) => padding || '0'};
  gap: ${({ gap }) => gap || '0'};
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  transition: all var(--progress-transition-all, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  position: relative;
  overflow: hidden;
  contain: layout style paint;

  ${Media.upToSmall()} {
    height: var(--progress-top-section-height, 200px);
    min-height: var(--progress-top-section-height, 200px);
    max-height: var(--progress-top-section-height, 200px);
  }

  > img,
  > svg {
    flex: 1;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    padding: 0;
    margin: 0;
  }

  > div {
    display: flex;
    width: 100%;
    height: 100%;
    flex: 1;
  }
`
