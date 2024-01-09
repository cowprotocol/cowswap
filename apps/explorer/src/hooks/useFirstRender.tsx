import React from 'react'

export default function useFirstRender(): boolean {
  const firstRender = React.useRef(true)

  React.useEffect(() => {
    firstRender.current = false
  }, [])

  return firstRender.current
}
