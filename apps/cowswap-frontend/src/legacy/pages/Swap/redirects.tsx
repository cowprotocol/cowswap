import { Navigate } from 'react-router'

// Redirects to swap but only replace the pathname
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RedirectPathToSwapOnly() {
  return <RedirectToPath path={'/swap'} />
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RedirectToPath({ path }: { path: string }) {
  return <Navigate to={path} />
}
