import { Font, UI } from '@cowprotocol/ui'

import Link from 'next/link'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import IMG_ICON_ARROW_RIGHT from '../src/assets/images/arrow-right.svg'

const Wrapper = styled(Link)`
  --size: 48px;
  min-height: var(--size);
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  border-radius: var(--size);
  font-weight: ${Font.weight.medium};
  padding: 5px 8px 5px 16px;
  text-decoration: none;
  color: var(${UI.COLOR_NEUTRAL_0});
  background: var(${UI.COLOR_NEUTRAL_100});
  transition:
    background 0.2s ease-in-out,
    color 0.2s ease-in-out;

  &:hover {
    background: var(${UI.COLOR_NEUTRAL_98});
    color: var(${UI.COLOR_NEUTRAL_20});

    > span {
      transform: translateX(3px);
    }
  }

  > b {
    font-weight: inherit;
  }

  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;
    width: 32px;
    background: var(${UI.COLOR_NEUTRAL_10});
    color: var(${UI.COLOR_NEUTRAL_100});
    border-radius: 50%;
    font-size: 18px;
    transition: transform 0.2s ease-in-out;
  }

  > span > svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`

interface ArrowButtonProps {
  link: string
  external?: boolean
  text?: string
}

export const ArrowButton = ({ link, external = false, text }: ArrowButtonProps) => (
  <Wrapper href={link} target={external ? '_blank' : '_self'} rel={external ? 'noopener noreferrer' : undefined}>
    {text && <b>{text}</b>}
    <span>
      <SVG src={IMG_ICON_ARROW_RIGHT} />
    </span>
  </Wrapper>
)
