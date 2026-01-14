'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Font, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { buildShareHref, copyUrl, openShare, type ShareTarget } from './ShareBlock.utils'

const ICON_PATH = '/images/icons/share'

const shareButtons: {
  id: ShareTarget
  label: string
  text?: string
  icon: string
  bg: string
  bgHover: string
  color: string
}[] = [
  {
    id: 'x',
    label: 'X',
    icon: `${ICON_PATH}/x.svg`,
    bg: '#0b0b0b',
    bgHover: '#202020',
    color: '#fff',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: `${ICON_PATH}/telegram.svg`,
    bg: '#2aabee',
    bgHover: '#40b6f1',
    color: '#fff',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: `${ICON_PATH}/linkedin.svg`,
    bg: '#0a66c2',
    bgHover: '#1f74cf',
    color: '#fff',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: `${ICON_PATH}/reddit.svg`,
    bg: '#ff4500',
    bgHover: '#ff5d24',
    color: '#fff',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: `${ICON_PATH}/whatsapp.svg`,
    bg: '#25d366',
    bgHover: '#3adb74',
    color: '#fff',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: `${ICON_PATH}/facebook.svg`,
    bg: '#1877f2',
    bgHover: '#2b86f6',
    color: '#fff',
  },
]

const actionButtons: { id: 'copy' | 'email' | 'web-share'; label: string; text?: string; icon: string }[] = [
  { id: 'email', label: 'Email', text: 'Email', icon: `${ICON_PATH}/email.svg` },
  { id: 'copy', label: 'Copy URL', text: 'Copy', icon: `${ICON_PATH}/copy-url.svg` },
  { id: 'web-share', label: 'Web Share', icon: `${ICON_PATH}/web-share.svg` },
]

interface ShareBlockProps {
  url: string
  title: string
  onShare?: () => void
}

export function ShareBlock({ url, title, onShare }: ShareBlockProps): ReactNode {
  const { shareUrl, webShareSupported, copied, handleShare, handleCopy, handleWebShare } = useShareBlockState({
    url,
    title,
    onShare,
  })

  return (
    <ShareBlockContainer>
      <ShareRow>
        <ShareTitle>Share</ShareTitle>
        <ShareButtons
          shareUrl={shareUrl}
          webShareSupported={webShareSupported}
          onShareTarget={handleShare}
          onCopy={handleCopy}
          onWebShare={handleWebShare}
        />
      </ShareRow>
      {copied && (
        <ShareNote role="status" aria-live="polite">
          Copied URL.
        </ShareNote>
      )}
    </ShareBlockContainer>
  )
}

interface ShareButtonsProps {
  shareUrl: string
  webShareSupported: boolean
  onShareTarget: (target: ShareTarget) => void
  onCopy: () => void | Promise<void>
  onWebShare: () => void | Promise<void>
}

function ShareButtons({
  shareUrl,
  webShareSupported,
  onShareTarget,
  onCopy,
  onWebShare,
}: ShareButtonsProps): ReactNode {
  return (
    <ShareGrid>
      {shareButtons.map(({ id, label, text, icon, bg, bgHover, color }) => (
        <ShareButton
          key={id}
          type="button"
          onClick={() => onShareTarget(id)}
          disabled={!shareUrl}
          $bg={bg}
          $bgHover={bgHover}
          $color={color}
          $iconOnly={!text}
          aria-label={text ? undefined : label}
          title={text ? undefined : label}
        >
          <ShareIcon $color={color} src={icon} aria-hidden="true" />
          {text && <span>{text}</span>}
        </ShareButton>
      ))}
      {actionButtons.map(({ id, label, text, icon }) => {
        if (id === 'web-share' && !webShareSupported) return null

        const onClick = id === 'copy' ? onCopy : id === 'email' ? () => onShareTarget('email') : onWebShare

        return (
          <ShareButton
            key={id}
            type="button"
            onClick={onClick}
            disabled={!shareUrl}
            $bg={`var(${UI.COLOR_NEUTRAL_20})`}
            $bgHover={`var(${UI.COLOR_NEUTRAL_30})`}
            $color={`var(${UI.COLOR_NEUTRAL_100})`}
            $iconOnly={!text}
            aria-label={text ? undefined : label}
            title={text ? undefined : label}
          >
            <ShareIcon $color={`var(${UI.COLOR_NEUTRAL_100})`} src={icon} aria-hidden="true" />
            {text && <span>{text}</span>}
          </ShareButton>
        )
      })}
    </ShareGrid>
  )
}

interface ShareState {
  shareUrl: string
  webShareSupported: boolean
  copied: boolean
  handleShare: (target: ShareTarget) => void
  handleCopy: () => Promise<void>
  handleWebShare: () => Promise<void>
}

function useShareBlockState({ url, title, onShare }: ShareBlockProps): ShareState {
  const [shareUrl, setShareUrl] = useState(url)
  const [shareTitle, setShareTitle] = useState(title)
  const [webShareSupported, setWebShareSupported] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const canonicalHref = canonicalLink?.href
    const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`
    const resolvedUrl = canonicalHref || new URL(window.location.pathname, origin).toString()

    const rawTitle = document.title?.trim() || title
    const cleanedTitle = rawTitle.replace(/\s*-\s*CoW DAO\s*$/i, '').trim()

    setShareUrl(resolvedUrl)
    setShareTitle(cleanedTitle || title)
    setWebShareSupported(Boolean(navigator.share))
  }, [title, url])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleShare = useCallback(
    (target: ShareTarget) => {
      if (!shareUrl) return
      const href = buildShareHref(target, shareUrl, shareTitle || title)
      if (target === 'email') {
        window.location.href = href
        onShare?.()
        return
      }
      openShare(href)
      onShare?.()
    },
    [shareUrl, shareTitle, title, onShare],
  )

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return
    await copyUrl(shareUrl)
    setCopied(true)
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current)
    }
    copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500)
    onShare?.()
  }, [shareUrl, onShare])

  const handleWebShare = useCallback(async () => {
    if (!shareUrl || !navigator.share) return
    try {
      await navigator.share({ title: shareTitle || title, url: shareUrl })
      onShare?.()
    } catch {}
  }, [shareTitle, shareUrl, title, onShare])

  return { shareUrl, webShareSupported, copied, handleShare, handleCopy, handleWebShare }
}

const ShareBlockContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin: 2.4rem 0 0;
  padding: 1.6rem;
  border-radius: 1.8rem;
  border: 0.1rem solid var(${UI.COLOR_NEUTRAL_80});
  background: var(${UI.COLOR_NEUTRAL_98});
  font-family: ${Font.family};
`

const ShareTitle = styled.div`
  flex-shrink: 0;
  font-size: 1.2rem;
  font-weight: ${Font.weight.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(${UI.COLOR_NEUTRAL_40});
`

const ShareRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem 1.2rem;
`

const ShareGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`

const ShareButton = styled.button<{ $bg: string; $bgHover: string; $color: string; $iconOnly: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $iconOnly }) => ($iconOnly ? '0' : '0.6rem')};
  height: 3.6rem;
  min-width: ${({ $iconOnly }) => ($iconOnly ? '3.6rem' : 'auto')};
  padding: ${({ $iconOnly }) => ($iconOnly ? '0' : '0 1.2rem')};
  border-radius: 0.9rem;
  border: none;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 1.6rem;
  font-weight: ${Font.weight.medium};
  cursor: pointer;
  transition: background-color 0.12s ease;

  > span {
    white-space: nowrap;
  }

  &&:hover {
    background-color: ${({ $bgHover }) => $bgHover};
    color: ${({ $color }) => $color};
  }

  &:focus-visible {
    outline: 0.2rem solid var(${UI.COLOR_NEUTRAL_100});
    outline-offset: 0.2rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ShareIcon = styled(SVG)<{ $color?: string }>`
  --size: 1.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  flex-shrink: 0;
  color: ${({ $color }) => $color || 'currentColor'};

  > svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`

const ShareNote = styled.div`
  font-size: 1.6rem;
  font-weight: ${Font.weight.medium};
  color: var(${UI.COLOR_NEUTRAL_40});
`
