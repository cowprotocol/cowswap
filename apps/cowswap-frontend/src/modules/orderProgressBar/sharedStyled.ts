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
  --fallback-height: 246px;
  width: 100%;
  height: var(--progress-top-section-height, var(--fallback-height));
  min-height: var(--progress-top-section-height, var(--fallback-height));
  max-height: var(--progress-top-section-height, var(--fallback-height));
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px 21px 0 0;
  padding: ${({ padding }) => padding || '0'};
  gap: ${({ gap }) => gap || '0'};
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  transition: all var(--progress-transition-all, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  position: relative;
  overflow: hidden;
  contain: layout style paint;

  ${Media.upToSmall()} {
    --fallback-height: 200px;
    height: var(--progress-top-section-height, var(--fallback-height));
    min-height: var(--progress-top-section-height, var(--fallback-height));
    max-height: var(--progress-top-section-height, var(--fallback-height));
  }

  > img,
  > svg {
    --size: 100%;
    flex: 1;
    width: var(--size);
    height: var(--size);
    max-width: var(--size);
    max-height: var(--size);
    object-fit: contain;
    object-position: center;
    padding: 0;
    margin: 0;
  }

  > div {
    display: flex;
  }
`
