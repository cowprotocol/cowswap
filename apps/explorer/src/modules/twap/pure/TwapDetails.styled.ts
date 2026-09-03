import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DetailsCard = styled.div`
  border: 1px solid ${Color.explorer_border};
  border-radius: 0.4rem;
  margin-bottom: 2.4rem;
  overflow: hidden;
`

export const DetailsGrid = styled.dl`
  display: grid;
  grid-template-columns: minmax(16rem, 24rem) 1fr;
  margin: 0;

  dt,
  dd {
    border-bottom: 1px solid ${Color.explorer_tableRowBorder};
    margin: 0;
    padding: 1.4rem 1.6rem;
  }

  dt {
    color: ${Color.explorer_textSecondary1};
    font-weight: ${({ theme }): string => theme.fontMedium};
  }

  dd {
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: normal;

    a {
      color: ${Color.explorer_textActive};
    }
  }

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;

    dt {
      border-bottom: 0;
      padding-bottom: 0.4rem;
    }
  }
`

export const SectionTitle = styled.h2`
  margin: 2.4rem 0 1.2rem;
`

export const TokenAmount = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 0.4rem;
`

export const EmptyParts = styled.div`
  min-height: 12rem;
  padding: 3.2rem;
  text-align: center;
`
