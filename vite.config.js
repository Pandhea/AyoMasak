import { cpSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const legacyAssetFolders = [
  'Buttons',
  'Jawa',
  'Stample',
  'logo',
  'map_menu',
  'new_button',
  'resource_bahan',
  'panci'
];
const imageExtensions = new Set(['.jpeg', '.jpg', '.png', '.webp']);
const audioFiles = [
  'AUD-20261024-WA0003.mp3',
  '810763__mokasza__single-bubble-pop-01.mp3'
];

function copyLegacyAssets() {
  return {
    name: 'copy-legacy-assets',
    apply: 'build',
    closeBundle() {
      for (const folder of legacyAssetFolders) {
        const source = resolve(projectRoot, 'assets', folder);
        const destination = resolve(projectRoot, 'dist', 'assets', folder);
        cpSync(source, destination, {
          recursive: true,
          filter(path) {
            if (statSync(path).isDirectory()) return true;
            const extension = extname(path).toLowerCase();
            return imageExtensions.has(extension) ||
              ((folder === 'logo' || folder === 'panci') && extension === '.svg');
          }
        });
      }

      for (const file of audioFiles) {
        cpSync(resolve(projectRoot, file), resolve(projectRoot, 'dist', file));
      }
    }
  };
}

// Legacy page paths that the Vue SPA handles (same list as vercel.json rewrites)
const legacyHtmlRoutes = [
  '/index.html',
  '/ayomasak-dapur.html',
  '/ayomasak-destinasi.html',
  '/ayomasak-index-masakan.html',
  '/ayomasak-pengaturan.html',
];

function devSpaFallback() {
  return {
    name: 'dev-spa-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (legacyHtmlRoutes.includes(url) && url !== '/index.html') {
          // Serve the SPA root HTML but keep original URL so browser pathname is preserved.
          // We transform and send the index HTML ourselves (same as Vite does internally).
          try {
            const html = await server.transformIndexHtml(url, '<!DOCTYPE html><html><head></head><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          } catch {
            // Fallback: let Vite handle it normally
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [vue(), copyLegacyAssets(), devSpaFallback()],
  base: './'
});
