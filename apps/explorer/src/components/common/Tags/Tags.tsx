import React from 'react'

import { Order } from 'api/operator'

import { Tag, TagsWrapper } from './Tags.styled'

export const Tags: React.FC<{ order: Order }> = ({ order }) => {
  return <TagsWrapper>{order.bridgeProviderId && <Tag>bridge</Tag>}</TagsWrapper>
}
