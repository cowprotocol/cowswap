import { ReactNode } from 'react'

import { StatusColorVariant } from '../../../theme/statusColors'

export enum BannerOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export interface InlineBannerProps {
  children?: ReactNode
  className?: string
  hideIcon?: boolean
  bannerType?: StatusColorVariant
  borderRadius?: string
  orientation?: BannerOrientation
  iconSize?: number
  iconPadding?: string
  customIcon?: string | ReactNode
  padding?: string
  margin?: string
  width?: string
  noWrapContent?: boolean
  onClose?: () => void
  backDropBlur?: boolean
  fontSize?: number
  noBackground?: boolean
  breakWord?: boolean
  customContent?: ReactNode
}

export interface CollapsibleInlineBannerProps extends Omit<InlineBannerProps, 'children'> {
  collapsedContent: ReactNode
  expandedContent: ReactNode
  defaultExpanded?: boolean
  isCollapsible?: boolean
  onToggle?: (isExpanded: boolean) => void
}
