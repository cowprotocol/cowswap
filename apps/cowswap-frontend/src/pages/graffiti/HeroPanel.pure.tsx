import type { ReactNode } from 'react'

import graffitiCowsImage from '@cowprotocol/assets/cow-swap/graffiti-cows.png'

import styled, { css } from 'styled-components/macro'

import * as styledEl from './wall.styled'

export interface HeroPanelProps {
  children: ReactNode
  /** Centre the column's text. The wall's own panels read better ragged right. */
  centered?: boolean
}

/** Mural on the left, everything else on the right; the mural drops out on a phone. */
const Split = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  ${styledEl.onNarrow(css`
    display: contents;
  `)}
`

const HeroSide = styled.div`
  flex: 0 0 auto;

  ${styledEl.onNarrow(css`
    display: none;
  `)}
`

const Hero = styled.img`
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
`

const Column = styled.div<{ $centered: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 320px;
  flex: 0 0 320px;
  text-align: ${({ $centered }) => ($centered ? 'center' : 'left')};

  ${styledEl.onNarrow(css`
    display: contents;
    text-align: center;
  `)}
`

/** The wall's panel shape, shared by the landing overlay and the network gate. */
export function HeroPanel({ children, centered = false }: HeroPanelProps): ReactNode {
  return (
    <Split>
      <HeroSide>
        <Hero src={graffitiCowsImage} alt="" />
      </HeroSide>
      <Column $centered={centered}>{children}</Column>
    </Split>
  )
}
