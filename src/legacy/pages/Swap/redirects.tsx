import { Navigate, useLocation } from 'react-router-dom'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  return <RedirectToPath path={'/swap'} />
}

export function RedirectToPath({ path }: { path: string }) {
  const location = useLocation()
  return <Navigate to={{ ...location, pathname: path }} />
}
