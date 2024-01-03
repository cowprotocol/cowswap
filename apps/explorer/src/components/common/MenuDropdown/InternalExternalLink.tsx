import React from 'react'
import SVG from 'react-inlinesvg'
import { StyledIcon } from 'components/common/MenuDropdown/styled'
import { ExternalLink } from 'components/analytics/ExternalLink'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { MenuImageProps, MenuItemKind, MenuLink } from './types'

function MenuImage(props: MenuImageProps): JSX.Element | null {
  const { title, iconSVG, icon } = props

  if (iconSVG) {
    return <SVG src={iconSVG} description={`${title} icon`} />
  } else if (icon) {
    return <img src={icon} alt={`${title} icon`} />
  } else {
    return null
  }
}

interface InternalExternalLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  link: MenuLink
  handleMobileMenuOnClick?: () => void
}

export default function InternalExternalMenuLink({
  link,
  handleMobileMenuOnClick,
  className,
}: InternalExternalLinkProps): JSX.Element {
  const { kind, title, url, iconSVG, icon } = link
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />
  const menuImageExternal = <StyledIcon icon={faExternalLink} />
  const isExternal = kind === MenuItemKind.EXTERNAL_LINK

  if (isExternal) {
    return (
      <ExternalLink target={'_blank'} href={url} onClickOptional={handleMobileMenuOnClick}>
        {menuImage}
        {title}
        {menuImageExternal}
      </ExternalLink>
    )
  } else {
    return (
      <LinkWithPrefixNetwork className={className} to={url} target="_self" onClickOptional={handleMobileMenuOnClick}>
        {menuImage}
        {title}
      </LinkWithPrefixNetwork>
    )
  }
}
