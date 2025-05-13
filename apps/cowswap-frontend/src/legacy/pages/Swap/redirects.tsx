import { Navigate } from 'react-router'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  return <RedirectToPath path={'/swap'} />
}

export function RedirectToPath({ path }: { path: string }) {
  return <Navigate to={path} />
}
