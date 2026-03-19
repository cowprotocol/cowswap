import { defineConfig } from 'vite'

import { viteConfigPublishableLib } from '../../tools/viteConfigPublishableLib'

export default defineConfig(viteConfigPublishableLib(__dirname, 'iframe-transport'))
