import { defineConfig } from 'vite'

import { viteConfigPublishableLib } from '../../tools/viteConfigPublishableLib'

export default defineConfig(
  viteConfigPublishableLib(__dirname, 'permit-utils', {
    additionalExternalDeps: ['@1inch/permit-signed-approvals-utils'],
  }),
)
