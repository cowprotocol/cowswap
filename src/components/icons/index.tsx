import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

interface IconProps {
  width?: string
  height?: string
  color?: string
}

const SvgWrap = styled.svg`
  .fill {
    fill: ${({ theme }) => theme.text4};
  }
  .stroke {
    stroke: ${({ theme }) => theme.text4};
  }
`

export const QuestionIcon: FunctionComponent<IconProps> = ({ color, width = '16' }): React.ReactElement => {
  return (
    <SvgWrap
      className="icon"
      width={width}
      height={width}
      viewBox="0 0 16 16"
      fill={'none'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={'stroke'}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity=".51"
        strokeWidth="1.333"
        d="M8 14.666A6.667 6.667 0 108 1.333a6.667 6.667 0 000 13.333z"
      />
      <path
        className={'stroke'}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity=".51"
        strokeWidth="1.333"
        d="M6.06 6a2 2 0 013.886.667c0 1.333-2 2-2 2M8 11.333h.007"
      />
    </SvgWrap>
  )
}

export const RollBackIcon: FunctionComponent<IconProps> = ({ color, width = '16' }): React.ReactElement => {
  return (
    <SvgWrap
      className="icon"
      width={width}
      height={width}
      viewBox="0 0 16 16"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
    </SvgWrap>
  )
}

QuestionIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.string,
}

RollBackIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.string,
}
