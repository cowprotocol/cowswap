
import { PixelAnalytics } from './PixelAnalytics'
import { FacebookPixel } from './providers/facebook'
import { LinkedinPixel } from './providers/linkedin'
import { MicrosoftPixel } from './providers/microsoft'
import { PavedPixel } from './providers/paved'
import { RedditPixel } from './providers/reddit'
import { TwitterPixel } from './providers/twitter'

const isPixelEnabled = false // For now this is disabled for all environments. We can enable it later by adding "isProd || isEns" instead of the hardcoded "false"

export function initPixelAnalytics(): PixelAnalytics | undefined {
  if (!isPixelEnabled) {
    return undefined
  }

  return new PixelAnalytics([
    new FacebookPixel(),
    new LinkedinPixel(),
    new MicrosoftPixel(),
    new PavedPixel(),
    new RedditPixel(),
    new TwitterPixel(),
  ])
}
