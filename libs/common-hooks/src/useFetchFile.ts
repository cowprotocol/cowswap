import { useEffect, useMemo, useState } from 'react'

function getErrorMessage(filePath: string, res: Response): string {
  return `Error fetching file ${filePath} - status: ${res.statusText}`
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFetchFile(filePath: string) {
  const [file, setFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fetchFile = async () => {
      await fetch(filePath)
        .then(async (res) => {
          if (res.ok) {
            const fileContent = await res.text()
            setFile(fileContent)
          } else {
            setError(getErrorMessage(filePath, res))
          }
        })
        .catch((res) => {
          setError(`Error fetching file ${filePath} - status: ${res.statusText}`)
        })
    }

    fetchFile()
  }, [filePath])

  return useMemo(() => ({ file, error }), [file, error])
}
