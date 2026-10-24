(() => {
  const loadingScreen = document.getElementById('gameLoadingScreen');
  if (!loadingScreen) return;

  if (window.self !== window.top || document.documentElement.classList.contains('embedded')) {
    loadingScreen.remove();
    return;
  }

  const minimumDisplayTime = 3000;
  const maximumAssetWaitTime = 4000;
  const idleStartScreen = document.getElementById('idleStartScreen');
  let loadingStartedAt;

  async function finishLoading() {
    loadingStartedAt = performance.now();
    const images = [...document.images].filter(image =>
      image.loading !== 'lazy' &&
      (image.getAttribute('src') || image.getAttribute('srcset') || image.currentSrc)
    );
    const assetsReady = Promise.all([
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
    let assetWaitTimeout;
    await Promise.race([
      assetsReady,
      new Promise(resolve => {
        assetWaitTimeout = window.setTimeout(resolve, maximumAssetWaitTime);
      })
    ]);
    window.clearTimeout(assetWaitTimeout);

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
      // Pastikan loading screen aktif dan terlihat sebelum melepas idle start screen
      loadingScreen.classList.remove('is-waiting');
      idleStartScreen.remove();
    }

    finishLoading();
  }

  if (idleStartScreen) {
    const handleStart = event => {
      idleStartScreen.removeEventListener('click', handleStart);
      startLoading();
    };
    if (new URLSearchParams(window.location.search).get('menu') === '1') {
      startLoading();
    } else {
      idleStartScreen.addEventListener('click', handleStart);
    }
  } else if (document.readyState === 'complete') {
    startLoading();
  } else {
    window.addEventListener('load', startLoading, { once: true });
  }
})();
