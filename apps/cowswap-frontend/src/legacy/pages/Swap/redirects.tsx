import { Navigate, useLocation } from 'react-router'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  return <RedirectToPath path={'/swap'} />
}

export function RedirectToPath({ path }: { path: string }) {
  const location = useLocation()

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[RedirectToPath] Rendering redirect:', {
      targetPath: path,
      currentLocation: location,
      search: location.search,
      hash: location.hash,
    })
  }

  const searchParams = new URLSearchParams(location.search)
  const search = searchParams.toString()
  const newLocation = {
    pathname: path,
    ...(search && { search }),
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[RedirectToPath] Redirecting to:', {
      from: location,
      to: newLocation,
      utmParamsInSearch: Array.from(searchParams.entries()).filter(([key]) => key.startsWith('utm_')),
    })
  }

  return <Navigate to={newLocation} />
}
