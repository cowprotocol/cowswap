import React, { CSSProperties, PropsWithChildren } from 'react'

const CSS_DEFAULT: CSSProperties = {
  margin: '2rem auto',
  outline: '2px dashed gray',
  padding: '1.5rem',
}

interface Props {
  style?: CSSProperties
}

export const Frame = ({ style, children }: PropsWithChildren<Props>) => (
  <div style={{ ...CSS_DEFAULT, ...style }}>{children}</div>
)
