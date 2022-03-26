/* eslint-env node */

import {chrome} from '../../.electron-vendors.cache.json';
import {join} from 'path';
import { defineConfig } from "vite";
import {builtinModules} from 'module';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader'

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
export default defineConfig(configEnv => {
  return {
    mode: process.env.MODE,
    root: PACKAGE_ROOT,
    resolve: {
      alias: {
        '~/': join(PACKAGE_ROOT, 'src') + '/',
      },
    },
    plugins: [vue(), svgLoader()],
    base: '',
    server: {
      fs: {
        strict: true,
      },
    },
    build: {
      sourcemap: true,
      target: `chrome${chrome}`,
      outDir: 'dist',
      assetsDir: '.',
      rollupOptions: {
        input: join(PACKAGE_ROOT, 'index.html'),
        external: [
          ...builtinModules.flatMap(p => [p, `node:${p}`]),
        ],
      },
      emptyOutDir: true,
      brotliSize: false,
    },
    test: {
      environment: 'happy-dom',
    },
  };
})
