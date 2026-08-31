(function () {
  const BASE_URL = 'https://proxy.garageband.rocks/embed';

  // SVG Icons
  const playIcon = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  const closeIcon = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  const newTabIcon = `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
  const pipIcon = `<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/></svg>`;

  let overlayElement = null;

  let extensionEnabled = true;

  function init() {
    // Fetch initial setting
    chrome.storage.local.get({ enableExtension: true }, (settings) => {
      extensionEnabled = settings.enableExtension;
      if (extensionEnabled) {
        checkAndInject();

        // Auto-play if ?play=1 is present
        if (window.location.search.includes('play=1') && !document.querySelector('.play-imdb-overlay')) {
          const info = getImdbInfo();
          if (info) openPlayer(info);
        }
      } else {
        removeButton();
      }
    });

    // Observe documentElement for SPA navigations and immediate DOM stream
    const observer = new MutationObserver(() => {
      if (extensionEnabled) {
        checkAndInject();
      } else {
        removeButton();
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function getImdbInfo() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length < 2 || segments[0] !== 'title' || !segments[1].startsWith('tt')) {
      return null;
    }
    const imdb_id = segments[1];

    let media_type = 'movie'; // default to movie
    const ogTypeElement = document.querySelector('meta[property="og:type"]');
    if (ogTypeElement && ogTypeElement.content) {
      media_type = ogTypeElement.content;
    } else if (document.body && document.body.innerText.includes('TV Series')) {
      media_type = 'video.tv_show';
    }

    return { imdb_id, media_type };
  }

  function checkAndInject() {
    const info = getImdbInfo();
    if (!info) {
      removeButton();
      return;
    }

    if (document.querySelector('.play-imdb-btn-wrapper')) {
      return; // Already injected for this page state
    }

    injectButton(info);
  }

  function removeButton() {
    const btn = document.querySelector('.play-imdb-btn-wrapper');
    if (btn) btn.remove();
  }

  function injectButton(info) {
    const h1 = document.querySelector('h1');
    if (!h1) return;

    const targetContainer = h1.parentElement;
    targetContainer.classList.add('play-imdb-title-grid');

    if (!targetContainer) return;

    // Extract details and save to local storage for the popup
    const titleText = h1.innerText;
    const ratingSpan = document.querySelector('[data-testid="hero-rating-bar__aggregate-rating__score"] span');
    const rating = ratingSpan ? ratingSpan.innerText.replace(/\/10$/, '') : 'N/A';
    let runtime = '';
    const inlineLists = document.querySelectorAll('ul.ipc-inline-list');
    for (const ul of inlineLists) {
      const texts = [...ul.children].map(li => li.innerText.trim());
      const rt = texts.find(t => t.match(/^\d+h( \d+m)?$|^\d+m$/));
      if (rt) {
        runtime = rt;
        break;
      }
    }

    let genre = '';
    const genreContainer = document.querySelector('[data-testid="genres"]') || document.querySelector('[data-testid="interests"]');
    if (genreContainer) {
      genre = genreContainer.querySelector('.ipc-chip__text')?.innerText || '';
    }
    if (!genre) {
      const genreLinks = [...document.querySelectorAll('a[href*="genres="]')].map(el => el.innerText.trim()).filter(Boolean);
      if (genreLinks.length > 0) genre = genreLinks[0];
    }

    let metaText = [runtime, genre].filter(Boolean).join(' • ');
    if (!metaText) metaText = 'Details unavailable';
    const posterImg = document.querySelector('.ipc-poster img');
    const posterSrc = posterImg ? posterImg.src : null;

    chrome.storage.local.set({
      lastMovie: {
        title: titleText,
        rating: rating,
        meta: metaText,
        imdbId: info.imdb_id,
        posterSrc: posterSrc,
        media_type: info.media_type
      }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'play-imdb-btn-wrapper';

    const btn = document.createElement('button');
    btn.className = 'play-imdb-btn';
    btn.setAttribute('aria-label', 'Play this title');
    btn.innerHTML = `${playIcon} PlayIMDb`;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPlayer(info);
    });

    wrapper.appendChild(btn);

    // Append inside the title/meta container
    targetContainer.appendChild(wrapper);
  }

  function getVideoUrl(info) {
    if (info.customUrl) return info.customUrl;
    let video_url = `${BASE_URL}/movie/${info.imdb_id}`;
    if (info.media_type === 'video.tv_show' || info.media_type === 'video.episode') {
      video_url = `${BASE_URL}/tv/${info.imdb_id}?autonext=1`;
    }
    return video_url;
  }

  function openPlayer(info) {
    if (overlayElement) return;

    const video_url = getVideoUrl(info);

    overlayElement = document.createElement('div');
    overlayElement.className = 'play-imdb-overlay';
    overlayElement.setAttribute('role', 'dialog');
    overlayElement.setAttribute('aria-modal', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'play-imdb-overlay-header';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'play-imdb-close-btn';
    closeBtn.setAttribute('aria-label', 'Close player');
    closeBtn.innerHTML = closeIcon;
    closeBtn.addEventListener('click', closePlayer);
    header.appendChild(closeBtn);

    // Player Container
    const playerContainer = document.createElement('div');
    playerContainer.className = 'play-imdb-player-container';
    const iframe = document.createElement('iframe');
    iframe.className = 'play-imdb-iframe';
    iframe.src = video_url;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    playerContainer.appendChild(iframe);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'play-imdb-overlay-footer';
    if ('documentPictureInPicture' in window) {
      const pipBtn = document.createElement('button');
      pipBtn.className = 'play-imdb-pip-btn';
      pipBtn.innerHTML = `Picture-in-Picture (PiP) ${pipIcon}`;
      pipBtn.addEventListener('click', async () => {
        try {
          const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 800, height: 450 });

          const style = pipWindow.document.createElement('style');
          style.textContent = `
            body { margin: 0; padding: 0; background: #000; overflow: hidden; }
            iframe { width: 100vw; height: 100vh; border: none; display: block; }
          `;
          pipWindow.document.head.appendChild(style);

          // Move iframe to PiP window
          pipWindow.document.body.appendChild(iframe);

          pipWindow.addEventListener('pagehide', () => {
            // Move iframe back to overlay when PiP closes
            if (playerContainer) {
              playerContainer.appendChild(iframe);
            }
          });

          overlayElement._pipWindow = pipWindow;
        } catch (e) {
          console.error('Failed to open PiP', e);
        }
      });
      footer.appendChild(pipBtn);
    }

    const newTabBtn = document.createElement('button');
    newTabBtn.className = 'play-imdb-new-tab-btn';
    newTabBtn.innerHTML = `Open in New Tab ${newTabIcon}`;
    newTabBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'open_new_tab', url: video_url });
    });
    footer.appendChild(newTabBtn);

    overlayElement.appendChild(header);
    overlayElement.appendChild(playerContainer);
    overlayElement.appendChild(footer);

    document.body.appendChild(overlayElement);
    document.body.classList.add('play-imdb-no-scroll');

    // Force reflow
    void overlayElement.offsetWidth;
    overlayElement.classList.add('play-imdb-active');

    // Event Listeners
    overlayElement.addEventListener('click', (e) => {
      if (e.target === overlayElement) closePlayer();
    });

    document.addEventListener('keydown', handleKeyDown);

    // Focus management
    closeBtn.focus();
  }

  function closePlayer() {
    if (!overlayElement) return;

    if (overlayElement._pipWindow && !overlayElement._pipWindow.closed) {
      overlayElement._pipWindow.close();
    }

    overlayElement.classList.remove('play-imdb-active');
    document.body.classList.remove('play-imdb-no-scroll');
    document.removeEventListener('keydown', handleKeyDown);

    // Wait for transition to finish before removing
    setTimeout(() => {
      if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
      }
    }, 250);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closePlayer();
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'open_player') {
      openPlayer({ imdb_id: request.url.split('/').pop(), media_type: 'custom', customUrl: request.url });
    }
  });

  // Run immediately!
  init();

})();
