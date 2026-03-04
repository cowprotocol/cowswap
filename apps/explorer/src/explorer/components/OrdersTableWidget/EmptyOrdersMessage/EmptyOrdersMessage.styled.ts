import { MEDIA } from 'const'
import styled from 'styled-components/macro'

import { BlockExplorerLink } from '../../../../components/common/BlockExplorerLink'

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2.4rem;

  > section {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    p {
      margin-top: 0;
    }
  }

  ul {
    padding: 0;
    margin: 0;

    > li {
      list-style: none;
      padding-bottom: 1.5rem;
      text-align: center;

      :last-child {
        padding-bottom: 0;
      }
    }
  }
`
export const StyledBlockExplorerLink = styled(BlockExplorerLink)`
  margin-top: 1rem;

  @media ${MEDIA.xSmallDown} {
    display: flex;
    justify-content: center;
  }
`
