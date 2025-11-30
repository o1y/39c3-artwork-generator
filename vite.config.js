import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import license from 'rollup-plugin-license';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    esbuild: {
      legalComments: 'inline'
    },
    rollupOptions: {
      output: {
        banner: `/*!
 * 39C3 Artwork Generator
 * Licensed under MIT
 *
 * Kario39C3VarWEB font is free for 39C3-related use only
 * Commercial use requires license from Show me Fonts (https://www.showmefonts.com/)
 *
 * Third-party dependencies - see LICENSES.txt for details
 */`,
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'assets/[name].[hash].css';
          }
          return 'assets/[name].[hash].[ext]';
        },
      },
      plugins: [
        license({
          thirdParty: {
            output: 'dist/LICENSES.txt'
          }
        })
      ],
    },
    chunkSizeWarningLimit: 1000,
  },

  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
});
