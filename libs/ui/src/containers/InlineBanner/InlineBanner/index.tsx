import { ReactNode } from 'react'

import { CloseIcon, Wrapper } from './styled'

import { StatusColorVariant, getStatusColorEnums } from '../../../theme/statusColors'
import { InlineBannerProps } from '../shared/types'
import { renderIcon } from '../shared/utils'

export function InlineBanner({
  children,
  className,
  hideIcon,
  bannerType = StatusColorVariant.Info,
  borderRadius,
  orientation,
  iconSize,
  iconPadding = '0',
  customIcon,
  padding,
  margin,
  width,
  onClose,
  noWrapContent,
  backDropBlur,
  fontSize,
}: InlineBannerProps): ReactNode {
  const colorEnums = getStatusColorEnums(bannerType)

  return (
    <Wrapper
      className={className}
      colorEnums={colorEnums}
      borderRadius={borderRadius}
      orientation={orientation}
      padding={padding}
      margin={margin}
      width={width}
      dismissable={!!onClose}
      backDropBlur={backDropBlur}
      fontSize={fontSize}
    >
      <span>
        {renderIcon(hideIcon, customIcon, iconSize, colorEnums, bannerType, iconPadding)}
        {noWrapContent ? children : <span>{children}</span>}
      </span>

      {onClose && <CloseIcon onClick={onClose} />}
    </Wrapper>
  )
}

export * from '../shared/types'
