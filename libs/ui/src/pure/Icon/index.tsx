import iconInformation from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import iconAlert from '@cowprotocol/assets/cow-swap/alert.svg'
import iconDanger from '@cowprotocol/assets/cow-swap/alert.svg'
import iconSuccess from '@cowprotocol/assets/cow-swap/check.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

export enum IconType {
  ALERT = 'ALERT',
  INFORMATION = 'INFORMATION',
  DANGER = 'DANGER',
  SUCCESS = 'SUCCESS',
}

const IconTypeMap: Record<IconType, string> = {
  [IconType.ALERT]: iconAlert,
  [IconType.INFORMATION]: iconInformation,
  [IconType.DANGER]: iconDanger,
  [IconType.SUCCESS]: iconSuccess,
}

interface IconProps {
  image: keyof typeof IconType
  size?: number
  bgColor?: UI | string
  color?: UI
  description?: string
  padding?: string
  borderRadius?: string
}

const Wrapper = styled.div<Omit<IconProps, 'image'>>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  min-width: ${({ size }) => size}px;
  min-height: ${({ size }) => size}px;
  border-radius: ${({ borderRadius }) => borderRadius};
  background-color: ${({ bgColor }) => (bgColor ? `var(${bgColor})` : 'transparent')};
  padding: ${({ padding }) => padding};
  color: ${({ color = UI.COLOR_TEXT }) => `var(${color})`};

  > svg {
    object-fit: contain;
    z-index: 2;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    fill: currentColor;
  }

  > svg > path {
    fill: currentColor;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Icon({
  image,
  size = 24,
  bgColor,
  color,
  description,
  borderRadius = '0',
  padding = '0 3px 0 0',
}: IconProps) {
  const svgPath = IconTypeMap[image]

  return (
    <Wrapper size={size} bgColor={bgColor} color={color} padding={padding} borderRadius={borderRadius}>
      <SVG src={svgPath} description={description} />
    </Wrapper>
  )
}
