export type FaviconSequenceOptions = {
  frameDuration?: number
  loop?: boolean
  onComplete?: () => void
}

const ANIMATED_FAVICON_ATTRIBUTE = 'data-animated-favicon'
const ICON_SELECTOR = 'link[rel~="icon"]'

export class FaviconAnimator {
  private readonly iconElements: HTMLLinkElement[]
  private animationId = 0
  private frameTimer: number | undefined
  private isRunning = false
  private readonly originalHrefs = new Map<HTMLLinkElement, string>()

  constructor(private defaultFrame: string) {
    const existingIcons = Array.from(document.querySelectorAll<HTMLLinkElement>(ICON_SELECTOR))

    if (existingIcons.length) {
      this.iconElements = existingIcons
    } else {
      const link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
      this.iconElements = [link]
    }

    this.iconElements.forEach((link) => {
      this.originalHrefs.set(link, link.href)
      this.decorateLink(link)
    })

    if (defaultFrame) {
      this.setHref(defaultFrame)
    } else {
      const firstFallback = this.originalHrefs.get(this.iconElements[0])
      if (firstFallback) {
        this.setHref(firstFallback)
      }
    }
  }

  play(frames: string[], options: FaviconSequenceOptions = {}): void {
    if (!frames.length) {
      this.resetToDefault()
      return
    }

    const { frameDuration = 120, loop = false, onComplete } = options

    this.cancelCurrentAnimation()

    const currentAnimationId = ++this.animationId
    let frameIndex = 0
    this.isRunning = true

    const step = (): void => {
      if (currentAnimationId !== this.animationId) {
        return
      }

      this.setHref(frames[frameIndex])
      frameIndex += 1

      const isLastFrame = frameIndex >= frames.length

      if (isLastFrame) {
        if (loop) {
          frameIndex = 0
        } else {
          this.isRunning = false
          this.frameTimer = window.setTimeout(() => {
            if (currentAnimationId === this.animationId) {
              onComplete?.()
            }
          }, frameDuration)
          return
        }
      }

      this.frameTimer = window.setTimeout(step, frameDuration)
    }

    step()
  }

  stop(): void {
    this.cancelCurrentAnimation()
    this.resetToDefault()
  }

  resetToDefault(): void {
    this.isRunning = false
    if (this.defaultFrame) {
      this.setHref(this.defaultFrame)
      return
    }

    this.iconElements.forEach((link) => {
      const originalHref = this.originalHrefs.get(link)

      if (originalHref) {
        this.setHref(originalHref, link)
        return
      }

      this.unsetHref(link)
    })
  }

  isAnimationRunning(): boolean {
    return this.isRunning
  }

  setDefaultFrame(frame: string): void {
    if (this.defaultFrame === frame) {
      return
    }

    this.defaultFrame = frame

    if (!this.isRunning) {
      this.resetToDefault()
    }
  }

  private cancelCurrentAnimation(): void {
    if (this.frameTimer) {
      window.clearTimeout(this.frameTimer)
      this.frameTimer = undefined
    }
    this.isRunning = false
  }

  private setHref(href: string, targetLink?: HTMLLinkElement): void {
    if (!href) {
      return
    }

    const applyHref = (link: HTMLLinkElement): void => {
      this.decorateLink(link)
      if (link.href !== href) {
        link.setAttribute('href', href)
      }
    }

    if (targetLink) {
      applyHref(targetLink)
      return
    }

    this.iconElements.forEach(applyHref)
  }

  private unsetHref(targetLink?: HTMLLinkElement): void {
    const unsetHref = (link: HTMLLinkElement): void => {
      const fallback = this.originalHrefs.get(link)
      if (fallback) {
        link.setAttribute('href', fallback)
        return
      }

      link.removeAttribute('href')
    }

    if (targetLink) {
      unsetHref(targetLink)
      return
    }

    this.iconElements.forEach(unsetHref)
  }

  private decorateLink(link: HTMLLinkElement): void {
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    link.sizes = 'any'
    link.setAttribute(ANIMATED_FAVICON_ATTRIBUTE, 'true')
  }
}
