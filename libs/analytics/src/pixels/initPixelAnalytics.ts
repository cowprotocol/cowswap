import { PixelAnalytics } from './PixelAnalytics'
import { FacebookPixel } from './providers/facebook'
import { LinkedinPixel } from './providers/linkedin'
import { MicrosoftPixel } from './providers/microsoft'
import { PavedPixel } from './providers/paved'
import { RedditPixel } from './providers/reddit'
import { TwitterPixel } from './providers/twitter'

import { isEns, isProd } from '@cowprotocol/common-utils'

export function initPixelAnalytics(): PixelAnalytics | null {
  const isPixelEnabled = isProd || isEns
  if (!isPixelEnabled) {
    return null
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
