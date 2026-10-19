(() => {
  const loadingScreen = document.getElementById('gameLoadingScreen');
  if (!loadingScreen) return;

  if (window.self !== window.top || document.documentElement.classList.contains('embedded')) {
    loadingScreen.remove();
    return;
  }

  async function finishLoading() {
    const images = [...document.images].filter(image =>
      image.getAttribute('src') || image.getAttribute('srcset') || image.currentSrc
    );
    await Promise.all([
      Promise.all(images.map(async image => {
        if (!image.complete) {
          await new Promise(resolve => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          });
        }

        if (!image.naturalWidth) {
          console.error(`Gagal memuat gambar: ${image.currentSrc || image.src}`);
          return;
        }

        if (typeof image.decode === 'function') {
          try {
            await image.decode();
          } catch (error) {
            console.error(`Gagal menyiapkan gambar: ${image.currentSrc || image.src}`, error);
          }
        }
      })),
      document.fonts.ready
    ]);

    loadingScreen.classList.add('is-hidden');
    loadingScreen.setAttribute('aria-hidden', 'true');
    await new Promise(resolve => {
      const timeout = window.setTimeout(resolve, 500);
      loadingScreen.addEventListener('transitionend', event => {
        if (event.target !== loadingScreen) return;
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
    });
    loadingScreen.remove();
  }

  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading, { once: true });
  }
})();
