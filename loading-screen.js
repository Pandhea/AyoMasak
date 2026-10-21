(() => {
  const loadingScreen = document.getElementById('gameLoadingScreen');
  if (!loadingScreen) return;

  if (window.self !== window.top || document.documentElement.classList.contains('embedded')) {
    loadingScreen.remove();
    return;
  }

  const minimumDisplayTime = 3000;
  const idleStartScreen = document.getElementById('idleStartScreen');
  let loadingStartedAt;

  async function finishLoading() {
    loadingStartedAt = performance.now();
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

    const remainingDisplayTime = minimumDisplayTime - (performance.now() - loadingStartedAt);
    if (remainingDisplayTime > 0) {
      await new Promise(resolve => window.setTimeout(resolve, remainingDisplayTime));
    }

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

  function startLoading() {
    if (idleStartScreen) {
      idleStartScreen.classList.add('is-hidden');
      idleStartScreen.setAttribute('aria-hidden', 'true');
      loadingScreen.classList.remove('is-waiting');
    }

    finishLoading();
  }

  if (idleStartScreen) {
    document.getElementById('idleStartButton').addEventListener('click', startLoading, { once: true });
  } else if (document.readyState === 'complete') {
    startLoading();
  } else {
    window.addEventListener('load', startLoading, { once: true });
  }
})();
