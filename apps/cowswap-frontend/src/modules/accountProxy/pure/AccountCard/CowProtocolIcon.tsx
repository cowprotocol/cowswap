import { ReactNode } from 'react'

import { UI, ProductLogo, ProductVariant, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Wrapper = styled.div<{
  height: number
  positionOffset?: number
  heightMobile?: number
  positionOffsetMobile?: number
}>`
  --positionBottomRight: ${({ positionOffset }) => (positionOffset !== undefined ? `${positionOffset}px` : '12px')};
  --mask-start: var(--cowprotocol-mask-start, 0%);
  --mask-end: var(--cowprotocol-mask-end, 40%);

  position: absolute;
  bottom: var(--positionBottomRight);
  right: var(--positionBottomRight);

  mask-image: linear-gradient(135deg, transparent 0%, transparent var(--mask-start), black var(--mask-end), black 100%);

  transition:
    --mask-start 0.3s ease-in-out,
    --mask-end 0.3s ease-in-out;

  > span {
    height: ${({ height }) => `${height}px`};
  }

  ${Media.upToSmall()} {
    --positionBottomRight: ${({ positionOffsetMobile, positionOffset }) => {
      if (positionOffsetMobile !== undefined) return `${positionOffsetMobile}px`
      if (positionOffset !== undefined) return `${positionOffset}px`
      return '12px'
    }};

    > span {
      height: ${({ heightMobile, height }) => `${heightMobile !== undefined ? heightMobile : height}px`};
    }
  }

  @property --mask-start {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 0%;
  }

  @property --mask-end {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 40%;
  }
`

export function CowProtocolIcon({
  className,
  height = 12,
  heightMobile,
  color = `var(${UI.COLOR_TEXT_OPACITY_25})`,
  colorHover = `var(${UI.COLOR_TEXT_OPACITY_50})`,
  positionOffset,
  positionOffsetMobile,
}: {
  className?: string
  height?: number
  heightMobile?: number
  color?: string
  colorHover?: string
  positionOffset?: number
  positionOffsetMobile?: number
}): ReactNode {
  return (
    <Wrapper
      className={className}
      height={height}
      heightMobile={heightMobile}
      positionOffset={positionOffset}
      positionOffsetMobile={positionOffsetMobile}
    >
      <ProductLogo
        variant={ProductVariant.CowProtocol}
        logoIconOnly
        height={height}
        overrideColor={color}
        overrideHoverColor={colorHover}
      />
    </Wrapper>
  )
}
