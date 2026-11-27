import type { ReactNode } from 'react'

/** `<` is escaped so a registry string can't close the script element */
export function JsonLd({ data }: { data: object }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
