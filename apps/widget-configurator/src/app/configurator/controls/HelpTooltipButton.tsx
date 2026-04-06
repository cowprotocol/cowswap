import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { createPortal } from 'react-dom'

const VIEWPORT_PADDING = 16
const TOOLTIP_SPACING = 8

interface HelpTooltipButtonProps {
  ariaLabel: string
  tooltip: ReactNode
}

interface TooltipPosition {
  top: number
  left: number
}

interface TooltipPortalProps {
  tooltip: ReactNode
  tooltipPosition: TooltipPosition
  tooltipRef: RefObject<HTMLDivElement | null>
}

function getTooltipPosition(button: HTMLButtonElement, tooltip: HTMLDivElement | null): TooltipPosition {
  const anchorRect = button.getBoundingClientRect()
  const tooltipWidth = tooltip?.offsetWidth || 320
  const tooltipHeight = tooltip?.offsetHeight || 0
  const maxLeft = window.innerWidth - VIEWPORT_PADDING - tooltipWidth
  const left = Math.max(VIEWPORT_PADDING, Math.min(anchorRect.left, maxLeft))
  const preferredTop = anchorRect.bottom + TOOLTIP_SPACING
  const shouldRenderAbove = tooltipHeight > 0 && preferredTop + tooltipHeight > window.innerHeight - VIEWPORT_PADDING
  const top = shouldRenderAbove
    ? Math.max(VIEWPORT_PADDING, anchorRect.top - tooltipHeight - TOOLTIP_SPACING)
    : preferredTop

  return { top, left }
}

function TooltipPortal({ tooltip, tooltipPosition, tooltipRef }: TooltipPortalProps): ReactNode {
  return createPortal(
    <Box
      ref={tooltipRef}
      role="tooltip"
      sx={(theme) => ({
        position: 'fixed',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex: 1500,
        width: 'min(24rem, calc(100vw - 3.2rem))',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '1rem',
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'rgba(5, 43, 101, 0.12) 0 0.8rem 1.6rem',
        p: '0.8rem 1rem',
      })}
    >
      {typeof tooltip === 'string' ? (
        <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.45, whiteSpace: 'pre-line' }}>{tooltip}</Typography>
      ) : (
        tooltip
      )}
    </Box>,
    document.body,
  )
}

export function HelpTooltipButton({ ariaLabel, tooltip }: HelpTooltipButtonProps): ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 })
  const isOpen = isHovered || isPinned

  useEffect(() => {
    if (!isPinned) {
      return
    }

    function handlePointerDown(event: MouseEvent): void {
      const target = event.target as Node

      if (!containerRef.current?.contains(target) && !tooltipRef.current?.contains(target)) {
        setIsPinned(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isPinned])

  useLayoutEffect(() => {
    if (!isOpen) {
      return
    }

    function updateTooltipPosition(): void {
      const button = buttonRef.current

      if (!button) {
        return
      }

      setTooltipPosition(getTooltipPosition(button, tooltipRef.current))
    }

    updateTooltipPosition()
    window.addEventListener('resize', updateTooltipPosition)
    window.addEventListener('scroll', updateTooltipPosition, true)

    return () => {
      window.removeEventListener('resize', updateTooltipPosition)
      window.removeEventListener('scroll', updateTooltipPosition, true)
    }
  }, [isOpen])

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <IconButton
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        ref={buttonRef}
        size="small"
        sx={{ p: 0.25 }}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsPinned((current) => !current)
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: 16 }} />
      </IconButton>
      {isOpen && typeof document !== 'undefined' ? (
        <TooltipPortal tooltip={tooltip} tooltipPosition={tooltipPosition} tooltipRef={tooltipRef} />
      ) : null}
    </Box>
  )
}
