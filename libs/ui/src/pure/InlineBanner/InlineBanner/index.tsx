import { ReactNode } from 'react'

import { CloseIcon, CustomContentBottom, CustomContentContainer, CustomContentTop, Wrapper } from './styled'

import { StatusColorVariant, getStatusColorEnums } from '../../../theme/statusColors'
import { BannerIcon } from '../shared/BannerIcon'
import { InlineBannerProps } from '../shared/types'

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
  noBackground,
  breakWord,
  customContent,
}: InlineBannerProps): ReactNode {
  const colorEnums = getStatusColorEnums(bannerType)

  const bannerIcon = (
    <BannerIcon
      hideIcon={hideIcon}
      customIcon={customIcon}
      iconSize={iconSize}
      colorEnums={colorEnums}
      bannerType={bannerType}
      iconPadding={iconPadding}
    />
  )

  const content = (
    <>
      {bannerIcon}
      {noWrapContent ? children : <span>{children}</span>}
    </>
  )

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
      noBackground={noBackground}
      breakWord={breakWord}
    >
      {customContent ? (
        <CustomContentContainer>
          <CustomContentTop>{content}</CustomContentTop>
          <CustomContentBottom>{customContent}</CustomContentBottom>
        </CustomContentContainer>
      ) : (
        <span>{content}</span>
      )}

      {onClose && <CloseIcon onClick={onClose} />}
    </Wrapper>
  )
}

export * from '../shared/types'
