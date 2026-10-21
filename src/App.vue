<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import LegacyPage from './components/LegacyPage.vue';

const pageByPath = {
  '/': 'home',
  '/index.html': 'home',
  '/ayomasak-dapur.html': 'kitchen',
  '/ayomasak-destinasi.html': 'destination',
  '/ayomasak-index-masakan.html': 'recipes',
  '/ayomasak-pengaturan.html': 'settings'
};

const page = ref(pageByPath[window.location.pathname] || 'home');
const storageError = ref('');

function handleHistoryNavigation() {
  page.value = pageByPath[window.location.pathname] || 'home';
}

function handleStorageError(event) {
  storageError.value = event.detail?.message || 'Perubahan data belum tersimpan.';
}

onMounted(() => {
  window.addEventListener('popstate', handleHistoryNavigation);
  window.addEventListener('ayo-storage-error', handleStorageError);
});

onUnmounted(() => {
  window.removeEventListener('popstate', handleHistoryNavigation);
  window.removeEventListener('ayo-storage-error', handleStorageError);
});
</script>

<template>
  <LegacyPage :key="page" :page="page" />
  <p v-if="storageError" class="application-storage-error" role="alert">
    {{ storageError }}
  </p>
</template>
