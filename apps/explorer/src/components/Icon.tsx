import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components/macro'

const Icon = styled(FontAwesomeIcon)`
  background: ${({ theme }): string => theme.grey}33;
  border-radius: 1rem;
  width: 1rem !important;
  height: 1rem;
  padding: 0.4rem;
  margin: 0 0 0 0.5rem;
  cursor: pointer;
`

export default Icon
