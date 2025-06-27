import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

/**
 * Specialized content section component for finished/cancellation steps.
 *
 * Business Context:
 * - Finished steps display a BOTTOM content section with either:
 *   - Educational tips ("Did you know?")
 *   - Surplus information (when user received surplus)
 * - This content includes: cow image + text content + CoW Swap logo
 * - On desktop: laid out horizontally with fixed height (246px)
 * - On mobile: content stacks vertically and needs flexible height
 */
export const FinishedStepContentSection = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  border-radius: 21px;
  background: transparent;
  height: var(--progress-top-section-height, 246px);
  min-height: var(--progress-top-section-height, 246px);
  contain: layout style paint;
  overflow: hidden;

  ${Media.upToSmall()} {
    height: auto;
    min-height: auto;
    max-height: none;
  }
`
