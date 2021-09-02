import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

interface IconProps {
  width?: string
  height?: string
  color?: string
}

const SvgWrap = styled.svg`
  fill: ${({ theme }) => theme.text4};
`

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
      <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
    </SvgWrap>
  )
}

RollBackIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.string,
}

export const QuestionIcon: FunctionComponent<IconProps> = ({ color, width = '16' }): React.ReactElement => {
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

export const CopyIcon: FunctionComponent<IconProps> = ({ color, width = '16' }): React.ReactElement => {
  return (
    <SvgWrap
      className="icon"
      width={width}
      height={width}
      viewBox="0 0 16 16"
      fill={color}
      style={{ transform: 'scale(-1, 1)' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" />
    </SvgWrap>
  )
}

CopyIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.string,
}
