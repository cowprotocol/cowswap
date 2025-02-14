import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: grid;
  row-gap: 1rem;
  justify-items: start;
  align-items: center;
  grid-template-columns: 11rem auto;
  grid-template-rows: max-content;
  padding: 0;

  ${Media.upToSmall()} {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
  }
`

export const RowTitle = styled.span`
  display: flex;
  align-items: center;
  font-weight: ${({ theme }): string => theme.fontBold};

  ${Media.upToSmall()} {
    margin: 1rem 0 0;
  }

  &::before {
    content: '▶';
    margin-right: 0.5rem;
    color: ${Color.explorer_grey};
    font-size: 0.75rem;
  }
`

export const RowContents = styled.span`
  display: flex;
  align-items: center;
  flex-flow: wrap;
  gap: 0.5rem;
`
