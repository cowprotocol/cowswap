import React from 'react'
import styled from 'styled-components'

import { FormMessage } from 'components/common/FormMessage'

const Wrapper = styled.div`
  margin: 0.5rem 0;
  padding: 0;
`

export interface Props {
  errorMessage?: string
}

export const FormInputError: React.FC<Props> = ({ errorMessage }) => {
  const message = errorMessage ? errorMessage : 'Stop using developer tools! :D'

  return (
    <Wrapper>
      <FormMessage className={errorMessage ? 'error' : 'hidden'}>{message}</FormMessage>
    </Wrapper>
  )
}
