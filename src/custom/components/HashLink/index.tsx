import React, { useEffect } from 'react'
import { LinkProps, useLocation, Link } from 'react-router-dom'

const HashLink = (props: LinkProps) => {
  const location = useLocation()

  useEffect(() => {
    // bail out if the hash doesn't match our proposed anchor hash
    if (props.to !== location.hash) return

    const id = location.hash.slice(1)
    const elem = document.getElementById(id)

    // scroll element into view if it exists
    elem?.scrollIntoView()
  }, [location.hash, props.to])

  return <Link {...props} />
}

export default HashLink
