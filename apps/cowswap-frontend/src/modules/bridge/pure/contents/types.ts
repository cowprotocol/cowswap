import { ReactNode } from 'react'

export interface ContentItem {
  withTimelineDot?: boolean
  label: ReactNode
  content: ReactNode
}
