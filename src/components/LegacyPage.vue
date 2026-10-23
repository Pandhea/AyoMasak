<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import homeDocument from '../legacy/index.html?raw';
import audioScript from '../../audio.js?raw';
import recipeCatalogScript from '../../recipe-catalog.js?raw';
import loadingScreenScript from '../../loading-screen.js?raw';
import kitchenDocument from '../legacy/ayomasak-dapur.html?raw';
import destinationDocument from '../legacy/ayomasak-destinasi.html?raw';
import recipesDocument from '../legacy/ayomasak-index-masakan.html?raw';
import settingsDocument from '../legacy/ayomasak-pengaturan.html?raw';

const props = defineProps({
  page: {
    type: String,
    required: true
  }
});

const documents = {
  home: homeDocument,
  kitchen: kitchenDocument,
  destination: destinationDocument,
  recipes: recipesDocument,
  settings: settingsDocument
};

const externalScripts = {
  'audio.js': audioScript,
  'recipe-catalog.js': recipeCatalogScript,
  'loading-screen.js': loadingScreenScript
};

const pageMarkup = ref('');
let insertedScripts = [];
let originalTitle = '';
let originalBodyClass = '';

async function executeScript(scriptElement) {
  const script = document.createElement('script');
  for (const attribute of scriptElement.attributes) {
    if (attribute.name !== 'src') script.setAttribute(attribute.name, attribute.value);
  }

  if (scriptElement.src) {
    const sourceName = new URL(scriptElement.getAttribute('src'), document.baseURI).pathname.split('/').pop();
    const source = externalScripts[sourceName];
    if (!source) throw new Error(`Skrip "${sourceName}" tidak ditemukan di bundle aplikasi.`);
    script.textContent = source;
  } else {
    script.textContent = `(() => {\n${scriptElement.textContent}\n})();`;
  }

  document.body.appendChild(script);
  insertedScripts.push(script);
}

async function renderLegacyPage() {
  const source = documents[props.page];
  if (!source) throw new Error(`Halaman "${props.page}" tidak ditemukan.`);

  const parsedDocument = new DOMParser().parseFromString(source, 'text/html');
  const title = parsedDocument.querySelector('title')?.textContent;
  const bodyClass = parsedDocument.body.className;
  const scripts = [...parsedDocument.querySelectorAll('script')];
  parsedDocument.querySelectorAll('script').forEach(script => script.remove());

  document.title = title || 'AyoMasak!';
  document.body.className = bodyClass;
  pageMarkup.value = parsedDocument.body.innerHTML;
  await nextTick();

  for (const script of scripts) await executeScript(script);
}

onMounted(() => {
  renderLegacyPage().catch(error => {
    console.error('Halaman AyoMasak gagal dimuat.', error);
    pageMarkup.value = `
      <main class="application-error" role="alert">
        <h1>Halaman belum dapat dimuat</h1>
        <p>Terjadi masalah saat menyiapkan halaman. Muat ulang untuk mencoba kembali.</p>
      </main>`;
  });
});

onBeforeUnmount(() => {
  insertedScripts.forEach(script => script.remove());
  insertedScripts = [];
  document.body.className = originalBodyClass;
  document.title = originalTitle;
});

originalTitle = document.title;
originalBodyClass = document.body.className;
</script>

<template>
  <div id="legacy-root" v-html="pageMarkup"></div>
</template>
