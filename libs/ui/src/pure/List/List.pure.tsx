import React, { ReactNode } from 'react'

import * as styledEl from './List.styled'

type ListExtraPropsBranch<E> = [E] extends [never]
  ? { extraProps?: never }
  : undefined extends E
    ? { extraProps?: E }
    : { extraProps: E }

export type BaseItemComponentProps<D, E = never> = {
  root: 'li' | 'div'
  data: D
} & ListExtraPropsBranch<E>

export type ListProps<D, E = never> = {
  root: 'ul' | 'ol'
  itemComponent: React.ComponentType<BaseItemComponentProps<D, E>>
  items: D[]
} & ListExtraPropsBranch<E>

export function List<D, E = never>(props: ListProps<D, E>): ReactNode {
  const { root, itemComponent: ItemComponent, items } = props
  const extraProps = 'extraProps' in props ? props.extraProps : undefined

  return (
    <styledEl.List as={root}>
      {items.map((item, index) => (
        // @ts-expect-error ListExtraPropsBranch<E> is not representable in JSX; ListProps at call sites is the contract.
        <ItemComponent key={index} root="li" data={item} extraProps={extraProps!} />
      ))}
    </styledEl.List>
  )
}
