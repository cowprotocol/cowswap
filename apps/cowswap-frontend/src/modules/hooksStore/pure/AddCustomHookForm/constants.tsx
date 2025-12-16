import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

export const ERROR_MESSAGES = {
  INVALID_URL_SPACES: msg`Invalid URL: URLs cannot contain spaces`,
  INVALID_URL_SLASHES: msg`Invalid URL: Path contains consecutive forward slashes`,
  HTTPS_REQUIRED: (
    <Trans>
      HTTPS is required. Please use <code>https://</code>
    </Trans>
  ),
  MANIFEST_PATH: msg`Please enter the base URL of your dapp, not the direct manifest.json path`,
  TIMEOUT: msg`Request timed out. Please try again.`,
  INVALID_MANIFEST: msg`Invalid manifest format: Missing "cow_hook_dapp" property in manifest.json`,
  SMART_CONTRACT_INCOMPATIBLE: msg`This hook is not compatible with smart contract wallets. It only supports EOA wallets.`,
  INVALID_HOOK_ID: msg`Invalid hook dapp ID format. The ID must be a 64-character hexadecimal string.`,
  INVALID_MANIFEST_HTML: (
    <Trans>
      The URL provided does not return a valid manifest file
      <br />
      <small>
        The server returned an HTML page instead of the expected JSON manifest.json file. Please check if the URL is
        correct and points to a valid hook dapp.
      </small>
    </Trans>
  ),
  CONNECTION_ERROR: msg`Could not connect to the provided URL. Please check if the URL is correct and the server is accessible.`,
  GENERIC_MANIFEST_ERROR: msg`Failed to load manifest. Please verify the URL and try again.`,
  NETWORK_COMPATIBILITY_ERROR: (
    chainId: number,
    chainLabel: string,
    supportedNetworks: { id: number; label: string }[],
  ) => (
    <p>
      <b>
        <Trans>Network compatibility error</Trans>
      </b>
      <br />
      <br />
      <Trans>This app/hook doesn't support the current network:</Trans>{' '}
      <b>
        {chainLabel} (<Trans>Chain ID:</Trans> {chainId})
      </b>
      .
      <br />
      <br />
      <Trans>Supported networks:</Trans>
      <br />
      {supportedNetworks.map(({ id, label }) => (
        <>
          • {label} (<Trans>Chain ID:</Trans> {id})
          <br />
        </>
      ))}
    </p>
  ),
  HOOK_POSITION_MISMATCH: (hookType: 'pre' | 'post') => (
    <p>
      <Trans>Hook position mismatch:</Trans>
      <br />
      <Trans>
        This app/hook can only be used as a <strong>{hookType}-hook</strong>
      </Trans>
      <br />
      and cannot be added as a {hookType === 'pre' ? 'post' : 'pre'}-hook.
    </p>
  ),
  MISSING_REQUIRED_FIELDS: (fields: string[]) => `Missing required fields in manifest: ${fields.join(', ')}`,
  MANIFEST_NOT_FOUND: msg`Invalid URL: No manifest.json file found. Please check the URL and try again.`,
  INVALID_URL_FORMAT: (error: Error) => (
    <>
      <Trans>Invalid URL format</Trans>
      <br />
      <small>
        <Trans>Technical details:</Trans> {error.message}
      </small>
    </>
  ),
}
