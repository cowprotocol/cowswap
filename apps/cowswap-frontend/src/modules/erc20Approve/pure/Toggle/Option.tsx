import { ReactNode } from 'react'

export function Option({
  title,
  children,
  onClick,
  isActive,
}: {
  title: string
  children: ReactNode
  onClick: () => void
  isActive?: boolean
}): ReactNode {
  return (
    <button onClick={onClick}>
      <div>{title}</div>
      {isActive}
      {children}
    </button>
  )
}
