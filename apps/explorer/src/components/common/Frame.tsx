import React, { CSSProperties, PropsWithChildren } from 'react'

const CSS_DEFAULT: CSSProperties = {
  margin: '2rem auto',
  outline: '2px dashed gray',
  padding: '1.5rem',
}

interface Props {
  style?: CSSProperties
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const Frame = ({ style, children }: PropsWithChildren<Props>) => (
  <div style={{ ...CSS_DEFAULT, ...style }}>{children}</div>
)
