import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    twttr: any
  }
}

interface LazyLoadTweetProps {
  tweetUrl: string
}

const LazyLoadTweet: React.FC<LazyLoadTweetProps> = ({ tweetUrl }) => {
  const tweetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && tweetRef.current) {
          tweetRef.current.innerHTML = `<blockquote class="twitter-tweet" data-dnt="true" data-theme="light"><a href="${tweetUrl}" target="_blank">Loading X...</a></blockquote>`
          if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load(tweetRef.current)
          }
          observer.disconnect()
        }
      },
      {
        threshold: 0.1, // Load the tweet when 10% of it is visible
      }
    )

    if (tweetRef.current) {
      observer.observe(tweetRef.current)
    }

    return () => {
      if (tweetRef.current) {
        observer.unobserve(tweetRef.current)
      }
    }
  }, [tweetUrl])

  return <div ref={tweetRef} style={{ width: '100%' }} />
}

export default LazyLoadTweet
