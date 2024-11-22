export const ERROR_MESSAGES = {
  INVALID_URL_SPACES: 'Invalid URL: URLs cannot contain spaces',
  INVALID_URL_SLASHES: 'Invalid URL: Path contains consecutive forward slashes',
  HTTPS_REQUIRED: (
    <>
      HTTPS is required. Please use <code>https://</code>
    </>
  ),
  MANIFEST_PATH: 'Please enter the base URL of your dapp, not the direct manifest.json path',
  TIMEOUT: 'Request timed out. Please try again.',
  INVALID_MANIFEST: 'Invalid manifest format: Missing "cow_hook_dapp" property in manifest.json',
  SMART_CONTRACT_INCOMPATIBLE: 'This hook is not compatible with smart contract wallets. It only supports EOA wallets.',
  INVALID_HOOK_ID: 'Invalid hook dapp ID format. The ID must be a 64-character hexadecimal string.',
  INVALID_MANIFEST_HTML: (
    <>
      The URL provided does not return a valid manifest file
      <br />
      <small>
        The server returned an HTML page instead of the expected JSON manifest.json file. Please check if the
        URL is correct and points to a valid hook dapp.
      </small>
    </>
  ),
  CONNECTION_ERROR: 'Could not connect to the provided URL. Please check if the URL is correct and the server is accessible.',
  GENERIC_MANIFEST_ERROR: 'Failed to load manifest. Please verify the URL and try again.'
}
