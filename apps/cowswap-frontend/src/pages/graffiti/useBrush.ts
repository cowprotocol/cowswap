import { useState } from 'react'

import { DEFAULT_BRUSH, DEFAULT_COLOR } from './wall.constants'

import type { Tool } from './wall.types'

export interface BrushState {
  color: string
  setColor: (color: string) => void
  brushSize: number
  setBrushSize: (size: number) => void
  label: string
  setLabel: (label: string) => void
  tool: Tool
  setTool: (tool: Tool) => void
  /** Colour a stroke paints with: the eraser paints the wall background. */
  paintColor: string
}

const ERASE_COLOR = '#000000'

export function useBrush(): BrushState {
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH)
  const [label, setLabel] = useState('')
  const [tool, setTool] = useState<Tool>('draw')

  return {
    color,
    setColor,
    brushSize,
    setBrushSize,
    label,
    setLabel,
    tool,
    setTool,
    // Erasing is still a paid write; it just writes black.
    paintColor: tool === 'erase' ? ERASE_COLOR : color,
  }
}
