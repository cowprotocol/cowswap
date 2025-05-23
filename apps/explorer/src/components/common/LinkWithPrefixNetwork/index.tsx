import React from 'react'

import { Link, LinkProps } from 'react-router'
import { usePathPrefix } from 'state/network'

interface LinkWithPrefixProps extends LinkProps {
  onClickOptional?: React.MouseEventHandler<HTMLAnchorElement>
}

export function LinkWithPrefixNetwork(props: LinkWithPrefixProps): React.ReactNode {
  const { to, children, onClickOptional, ...otherParams } = props
  const prefix = usePathPrefix()
  const _to = prefix ? `/${prefix}${to}` : to

  return (
    <Link to={_to} onClick={(event): void => onClickOptional && onClickOptional(event)} {...otherParams}>
      {children}
    </Link>
  )
}
