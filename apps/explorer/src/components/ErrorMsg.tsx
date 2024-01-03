import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDizzy } from '@fortawesome/free-regular-svg-icons'
import { SizeProp } from '@fortawesome/fontawesome-svg-core'

const Wrapper = styled.div`
  text-align: center;
  font-size: 1.6rem;
  margin: auto;

  p {
    color: var(--color-text-secondary);
  }
`

interface ErrorMsgProps {
  title?: string
  size?: string
  message: string
}

const ErrorMsg: React.FC<ErrorMsgProps> = ({ title, message, size = '6x' }: ErrorMsgProps) => (
  <Wrapper>
    <FontAwesomeIcon icon={faDizzy} size={size as SizeProp} />
    {title && <h3>{title}</h3>}
    <p>{message}</p>
  </Wrapper>
)

export default ErrorMsg
