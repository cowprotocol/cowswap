const REDIRECT_URL = 'https://mevblocker.io'
const REDIRECT_SECONDS = 5

export default function Head(): JSX.Element {
  return <meta httpEquiv="refresh" content={`${REDIRECT_SECONDS};url=${REDIRECT_URL}`} />
}
