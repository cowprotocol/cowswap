import styled from 'styled-components/macro'
import { Media } from '@cowprotocol/ui'

import StyledUserDetailsTable from '../../common/StyledUserDetailsTable'
import { ScrollBarStyle } from '../../../explorer/styled'

export const WrapperUserDetailsTable = styled(StyledUserDetailsTable)`
  overflow-x: auto;
  white-space: nowrap;

  ${ScrollBarStyle}

  > thead > tr,
  > tbody > tr {
    display: grid;
    grid-template-columns:
      17rem
      5rem
      minmax(18rem, 1fr)
      minmax(18rem, 1fr)
      minmax(18rem, 1fr)
      minmax(20rem, 1fr)
      19rem
      13rem;

    grid-template-rows: max-content;
    width: 100%;
  }

  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      img {
        padding: 0;
      }
    }
  }
`

export const HeaderTitle = styled.span``
export const HeaderValue = styled.span``
