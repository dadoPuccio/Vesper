import { defineConfig } from "vite"
import gltf from 'rollup-plugin-gltf';

// vite.config.js
export default defineConfig({
    base: '/Vesper/',
    assetsInclude: ['models/*'],
    plugins: [
        gltf({
          include: '**/*.gltf',
          inlineAssetLimit: 250 * 1024, // 250kb
          inline: false,
        }),
      ]
  })
  
