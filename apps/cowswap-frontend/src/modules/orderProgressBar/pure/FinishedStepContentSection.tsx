import { Media, UI } from '@cowprotocol/ui'

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
  background: var(${UI.COLOR_PAPER_DARKER});
  height: var(--progress-top-section-height, 246px);
  min-height: var(--progress-top-section-height, 246px);
  contain: layout style paint;
  overflow: hidden;

  ${Media.upToSmall()} {
    /* 
     * MOBILE LAYOUT: Allow flexible height for tips/surplus content
     * The finished step shows complex bottom content that stacks on mobile:
     * - Large cow illustration
     * - Tips text or surplus information  
     * - CoW Swap logo
     * Fixed height (200px) would cut off this stacked content
     */
    height: auto;
    min-height: auto;
    max-height: none;
  }
`
