import React from 'react'

import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Order } from 'api/operator'

const Tag = styled.div`
  font-weight: ${({ theme }): string => theme.fontBold};
  border-radius: 0.4rem;
  line-height: 1.1;
  padding: 0.5rem 0.8rem;
  display: flex;
  align-items: center;
  width: fit-content;
  white-space: nowrap;
  font-size: 1.1rem;
  text-transform: uppercase;
  background: ${Color.explorer_greyOpacity};
  color: ${Color.explorer_grey};
`

const TagsWrapper = styled.div`
  display: flex;
  justify-content: center;
`

export const Tags: React.FC<{ order: Order }> = ({ order }) => {
  return <TagsWrapper>{order.bridgeProviderId && <Tag>bridge</Tag>}</TagsWrapper>
}
