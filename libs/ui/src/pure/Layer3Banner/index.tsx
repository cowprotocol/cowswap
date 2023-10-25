import { Helmet } from 'react-helmet'

export function Layer3Banner() {
  return (
    <>
      <Helmet>
        <script src="https://layer3.xyz/embed.js"></script>
      </Helmet>
      <div className="layer3-quest layer3-card" data-quest-id="halloween-cowswap"></div>
    </>
  )
}
