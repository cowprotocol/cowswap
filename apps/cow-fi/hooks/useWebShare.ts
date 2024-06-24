import { useCallback, useState } from 'react'

interface ShareOptions {
  title: string
  text: string
  url: string
}

const useWebShare = () => {
  const [message, setMessage] = useState<string | null>(null)

  const share = useCallback((options: ShareOptions) => {
    if (navigator.share) {
      navigator
        .share({
          title: options.title,
          text: options.text,
          url: options.url,
        })
        .then(() => {
          setMessage('Successfully shared')
          setTimeout(() => setMessage(null), 3000) // Hide message after 3 seconds
        })
        .catch((error) => {
          setMessage('Error sharing content')
          setTimeout(() => setMessage(null), 3000) // Hide message after 3 seconds
          console.error('Error sharing:', error)
        })
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard
        .writeText(options.url)
        .then(() => {
          setMessage('URL copied to clipboard! You can now share it manually.')
          setTimeout(() => setMessage(null), 3000) // Hide message after 3 seconds
        })
        .catch((error) => {
          setMessage('Error copying to clipboard')
          setTimeout(() => setMessage(null), 3000) // Hide message after 3 seconds
          console.error('Error copying to clipboard:', error)
        })
    }
  }, [])

  return { share, message }
}

export default useWebShare
