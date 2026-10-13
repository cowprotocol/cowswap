import React from 'react'

export default function useFirstRender(): boolean {
  const firstRender = React.useRef(true)

  React.useEffect(() => {
    firstRender.current = false
  }, [])

  // eslint-disable-next-line react-hooks/refs
  return firstRender.current
}
