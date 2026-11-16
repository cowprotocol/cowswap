import { ReactElement } from 'react'

import { SAMPLES } from './solverLogoTool.constants'
import { Guidelines } from './solverLogoTool.styled'

export function LogoGuidelines(): ReactElement {
  return (
    <Guidelines id="solver-logo-guidelines" aria-labelledby="solver-logo-guidelines-title">
      <h2 id="solver-logo-guidelines-title">A few things make a big difference.</h2>
      <p>Use one logo-only asset that stays recognisable in both themes.</p>
      <div className="guideline-grid">
        <article>
          <div className="guideline-demo">
            <figure>
              <div className="guide-circle crowded">
                <img src={SAMPLES.fibrous.url} alt="Fibrous mark cropped at the edge" />
              </div>
              <figcaption>Too close to the edge</figcaption>
            </figure>
            <figure>
              <div className="guide-circle">
                <img src={SAMPLES.fibrous.url} alt="Fibrous mark with clear space around it" />
              </div>
              <figcaption>Room to breathe</figcaption>
            </figure>
          </div>
          <h3>Give the mark some space.</h3>
          <p>
            Keep the entire mark inside the crop. Use the safe-area guide as a starting point, then check the small
            previews.
          </p>
        </article>
        <article>
          <div className="guideline-demo">
            <figure>
              <div className="theme-example">
                <img src={SAMPLES.fibrous.url} alt="Fibrous logo on white" />
              </div>
              <figcaption>Light background</figcaption>
            </figure>
            <figure>
              <div className="theme-example dark">
                <img src={SAMPLES.fibrous.url} alt="Fibrous logo on navy" />
              </div>
              <figcaption>Dark background</figcaption>
            </figure>
          </div>
          <h3>Check both sides.</h3>
          <p>
            Watch for pale details disappearing on white or dark details fading into navy. An intentional background can
            help.
          </p>
        </article>
        <article>
          <div className="format-example">
            <span>SVG</span>
            <span>
              PNG<small>1024 × 1024</small>
            </span>
          </div>
          <h3>Start with a good source.</h3>
          <p>
            Use a vector SVG when available, or a high-resolution PNG. Enlarging a small bitmap does not add detail.
            Keep text out of tiny icons.
          </p>
        </article>
      </div>
    </Guidelines>
  )
}
