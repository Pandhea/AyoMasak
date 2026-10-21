import { createApp } from 'vue';
import App from './App.vue';
import { initializeStorage } from './services/storage.js';
import '../style.css';

async function startApplication() {
  await initializeStorage();

  const embedded = new URLSearchParams(window.location.search).get('embed') === '1';
  document.documentElement.classList.toggle('embedded', embedded);
  createApp(App).mount('#app');
}

startApplication().catch(error => {
  console.error('AyoMasak gagal dimulai.', error);
  document.querySelector('#app').innerHTML = `
    <main class="application-error" role="alert">
      <h1>Aplikasi belum dapat dimulai</h1>
      <p>Data lokal tidak dapat dibuka. Periksa dukungan penyimpanan browser, lalu muat ulang aplikasi.</p>
    </main>`;
});
