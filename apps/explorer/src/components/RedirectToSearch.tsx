import React from 'react'
import { usePathPrefix, usePathSuffix } from 'state/network'
import { Redirect } from 'react-router-dom'

interface RedirectToSearchParams {
  from: string
  data?: unknown
}

const RedirectToSearch: React.FC<RedirectToSearchParams> = ({ from, data }) => {
  const prefix = usePathPrefix() || ''
  const prefixPath = prefix ? `/${prefix}` : ''
  const suffix = usePathSuffix() || ''
  const pathMatchArray = suffix.match(`${from}(.*)`)

  const newPath =
    pathMatchArray && pathMatchArray.length > 0 ? `${prefixPath}/search${pathMatchArray[1]}` : `${prefixPath}${suffix}`

  return <Redirect push={false} to={{ pathname: newPath, state: { referrer: from, data } }} />
}

export default RedirectToSearch
