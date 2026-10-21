<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import homeDocument from '../legacy/index.html?raw';
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
    script.src = new URL(scriptElement.getAttribute('src'), document.baseURI).href;
    await new Promise((resolve, reject) => {
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error(`Gagal memuat skrip ${script.src}`)), { once: true });
      document.body.appendChild(script);
    });
  } else {
    script.textContent = scriptElement.textContent;
    document.body.appendChild(script);
  }

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
