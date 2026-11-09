import { useState } from 'react'

import { useSyncRef } from './useSyncRef'
import { DEFAULT_BRUSH, DEFAULT_COLOR } from './wall.constants'

import type { Tool, WallRefs } from './wall.types'

export interface BrushState {
  color: string
  setColor: (color: string) => void
  brushSize: number
  setBrushSize: (size: number) => void
  label: string
  setLabel: (label: string) => void
  tool: Tool
  setTool: (tool: Tool) => void
}

const ERASE_COLOR = '#000000'

export function useBrush({ brushSizeRef, colorRef, toolRef }: WallRefs): BrushState {
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH)
  const [label, setLabel] = useState('')
  const [tool, setTool] = useState<Tool>('draw')

  // The render loop and input handlers read these through refs. The eraser
  // paints with the wall background (black); it is still a paid write.
  useSyncRef(brushSizeRef, brushSize)
  useSyncRef(colorRef, tool === 'erase' ? ERASE_COLOR : color)
  useSyncRef(toolRef, tool)

  return { color, setColor, brushSize, setBrushSize, label, setLabel, tool, setTool }
}
