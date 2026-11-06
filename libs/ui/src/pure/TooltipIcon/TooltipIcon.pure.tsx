import { ReactNode, useCallback, useState } from 'react'

import svgQuestionSrc from '@cowprotocol/assets/svg/question.svg'
import { useMediaQuery } from '@cowprotocol/common-hooks'

import { t } from '@lingui/core/macro'

import * as styledEl from './TooltipIcon.styled'

import { Media } from '../../consts'
import { BottomDrawer } from '../BottomDrawer/BottomDrawer.pure'
import { Modal } from '../Modal/Modal.pure'
import { TooltipPlacement } from '../Tooltip/Tooltip'

export interface TooltipIconProps {
  type: TooltipIconType
  content: ReactNode
  /** Drawer heading; defaults to a label derived from `type`. */
  title?: string
  placement?: TooltipPlacement
}

export type TooltipIconType = 'info' | 'alert' | 'help'

const ICON_SIZE_PX = 14

export function TooltipIcon({ type, content, title, placement }: TooltipIconProps): ReactNode {
  const isNarrowViewport = useMediaQuery(Media.upToExtraSmall(false))
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const shouldOpenInDrawer = isNarrowViewport || !hasFinePointer
  const showClickForDetailsHint = isNarrowViewport && hasFinePointer

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerTitle = title ?? getDefaultDrawerTitle(type)

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsDrawerOpen(open)
  }, [])

  const icon = <TooltipTypeIcon type={type} />

  if (shouldOpenInDrawer) {
    const trigger = (
      <styledEl.TriggerButton type="button" onClick={openDrawer} aria-label={drawerTitle}>
        {icon}
      </styledEl.TriggerButton>
    )

    return (
      <>
        {showClickForDetailsHint ? (
          <styledEl.InstantTooltip content={t`Click for details`} placement={placement}>
            {trigger}
          </styledEl.InstantTooltip>
        ) : (
          trigger
        )}
        <BottomDrawer isOpen={isDrawerOpen} onOpenChange={handleDrawerOpenChange} a11yTitle={drawerTitle}>
          <Modal.Root>
            <Modal.Header title={drawerTitle} titleAs={BottomDrawer.Title} onClose={closeDrawer} />
            <Modal.Content>{content}</Modal.Content>
          </Modal.Root>
        </BottomDrawer>
      </>
    )
  }

  return (
    <styledEl.InstantTooltip content={content} placement={placement}>
      {icon}
    </styledEl.InstantTooltip>
  )
}

function getDefaultDrawerTitle(type: TooltipIconType): string {
  switch (type) {
    case 'info':
      return t`Info`
    case 'alert':
      return t`Alert`
    case 'help':
      return t`Help`
  }
}

function TooltipTypeIcon({ type }: { type: TooltipIconType }): ReactNode {
  switch (type) {
    case 'info':
      return <styledEl.InfoIcon size={ICON_SIZE_PX} />
    case 'alert':
      return <styledEl.AlertIcon size={ICON_SIZE_PX} />
    case 'help':
      return <styledEl.HelpIcon src={svgQuestionSrc} width={ICON_SIZE_PX} height={ICON_SIZE_PX} />
  }
}
