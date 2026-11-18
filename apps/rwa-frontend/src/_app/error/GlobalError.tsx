'use client'

import { type ReactNode, useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'

interface GlobalErrorProps {
  error: Error & { digest?: string }
}

/** Replaces the root layout when it throws, so it renders its own `<html>` */
export function GlobalError({ error }: GlobalErrorProps): ReactNode {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
