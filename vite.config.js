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
    }
  };
}

export default defineConfig({
  plugins: [vue(), copyLegacyAssets()],
  base: './'
});
