import type { ReactNode } from 'react'

import graffitiCowsImage from '@cowprotocol/assets/cow-swap/graffiti-cows.png'

import styled, { css } from 'styled-components/macro'

import * as styledEl from './wall.styled'

export interface HeroPanelProps {
  children: ReactNode
  /** Drop the mural where it would stack: for panels with too much copy to share the height. */
  hideHero?: boolean
  /** Let the mural absorb the height the copy leaves over. Only for a panel stretched to its container. */
  fillHeight?: boolean
}

/** Mural beside the copy, or stacked on top of it once the stage is too narrow for both. */
const Split = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  ${styledEl.onStacked(css`
    display: contents;
  `)}
`

const HeroSide = styled.div<{ $hidden: boolean; $fill: boolean }>`
  flex: 0 1 auto;
  min-width: 0;

  ${styledEl.onStacked(css`
    width: 100%;
  `)}

  ${({ $fill }) =>
    $fill &&
    styledEl.onNarrow(css`
      display: flex;
      flex: 1 1 auto;
      min-height: 100px;
      align-items: center;
      justify-content: center;
    `)}

  ${({ $hidden }) =>
    $hidden &&
    styledEl.onStacked(css`
      display: none;
    `)}
`

const Hero = styled.img<{ $fill: boolean }>`
  /*
   * The landing panel is centred in an absolutely-positioned overlay, so a tall
   * image spills out of the stage rather than pushing it: the square source
   * means capping the width by viewport height also caps the height.
   */
  width: min(clamp(300px, 30vw, 600px), 46dvh);
  max-width: 100%;
  display: block;
  border-radius: 12px;
  border: 1px solid ${styledEl.wallColors.border};
  box-shadow: 0 0 22px rgba(168, 85, 247, 0.45);

  /*
   * Stacked above the copy, so a short screen must still fit the panel. The width
   * cap only bites where the column has a definite width, hence the height one too.
   */
  ${styledEl.onStacked(css`
    width: min(100%, 26dvh);
    max-height: 26dvh;
    margin: 0 auto;
  `)}

  /* Sized by the space its flex parent won, rather than claiming a share of its own. */
  ${({ $fill }) =>
    $fill &&
    styledEl.onNarrow(css`
      width: auto;
      height: auto;
      max-height: 100%;
      margin: 0;
    `)}
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 1 320px;
  min-width: 0;
  text-align: left;

  ${styledEl.onStacked(css`
    display: contents;
    text-align: center;
  `)}
`

/** The wall's panel shape, shared by the landing overlay and the network gate. */
export function HeroPanel({ children, hideHero = false, fillHeight = false }: HeroPanelProps): ReactNode {
  return (
    <Split>
      <HeroSide $hidden={hideHero} $fill={fillHeight}>
        <Hero src={graffitiCowsImage} alt="" $fill={fillHeight} />
      </HeroSide>
      <Column>{children}</Column>
    </Split>
  )
}
