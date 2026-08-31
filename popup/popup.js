document.addEventListener('DOMContentLoaded', () => {
  let currentMovie = null;

  /* ─── View Routing ─────────────────────────────────────── */
  const mainView = document.getElementById('mainView');
  const aboutView = document.getElementById('aboutView');
  const mainFooter = document.getElementById('mainFooter');
  const aboutFooter = document.getElementById('aboutFooter');
  const btnAbout = document.getElementById('btnAbout');
  const btnCloseAbout = document.getElementById('btnCloseAbout');

  function showAbout(on) {
    [mainView, mainFooter].filter(Boolean).forEach(el => el.classList.toggle('hidden', on));
    [aboutView, aboutFooter].filter(Boolean).forEach(el => el.classList.toggle('hidden', !on));
    if (btnAbout) btnAbout.classList.toggle('hidden', on);
    if (btnCloseAbout) btnCloseAbout.classList.toggle('hidden', !on);
  }

  btnAbout.addEventListener('click', () => showAbout(true));
  btnCloseAbout.addEventListener('click', () => showAbout(false));

  /* ─── IMDb open link ───────────────────────────────────── */
  document.getElementById('goToImdb').addEventListener('click', e => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://www.imdb.com' });
  });

  /* ─── Watchlist ────────────────────────────────────────── */
  const watchlistContainer = document.getElementById('watchlistContainer');
  const watchlistCountEl = document.getElementById('watchlistCount');
  const qaWatchlist = document.getElementById('qaWatchlist');
  const watchlistText = document.getElementById('watchlistText');

  function getWatchlist(cb) {
    chrome.storage.local.get({ watchlist: [] }, d => cb(d.watchlist));
  }

  function setWatchlist(list, cb) {
    chrome.storage.local.set({ watchlist: list }, cb);
  }

  function renderWatchlist() {
    getWatchlist(list => {
      watchlistCountEl.textContent = list.length;

      // Determine existing IDs in DOM
      const existing = new Set(
        [...watchlistContainer.querySelectorAll('.wl-card')].map(el => el.dataset.id)
      );
      const incoming = new Set(list.map(m => m.imdbId));

      // Remove cards that are no longer in list
      watchlistContainer.querySelectorAll('.wl-card').forEach(card => {
        if (!incoming.has(card.dataset.id)) {
          card.classList.add('removing');
          setTimeout(() => card.remove(), 320);
        }
      });

      // Show/hide empty state
      let emptyEl = document.getElementById('emptyWatchlist');
      if (list.length === 0) {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.id = 'emptyWatchlist';
          emptyEl.className = 'empty-watchlist';
          emptyEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.1)"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            <p>Your watchlist is empty</p>
            <span>Save movies & shows to watch later</span>
          `;
          watchlistContainer.appendChild(emptyEl);
        }
        return;
      } else if (emptyEl) {
        emptyEl.remove();
      }

      // Add new cards
      list.forEach(movie => {
        if (existing.has(movie.imdbId)) return; // already rendered
        const card = createWatchlistCard(movie);
        watchlistContainer.appendChild(card);
      });
    });
  }

  function createWatchlistCard(movie) {
    const card = document.createElement('div');
    card.className = 'wl-card';
    card.dataset.id = movie.imdbId;
    card.innerHTML = `
      <div class="wl-poster" style="background-image:url('${movie.posterSrc || ''}')"></div>
      <div class="wl-details">
        <span class="wl-title">${movie.title || 'Unknown'}</span>
        <span class="wl-meta">${movie.meta || 'Details unavailable'}</span>
      </div>
      <div class="wl-btns">
        <button class="wl-play" title="Play">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="wl-remove" title="Remove">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;

    card.querySelector('.wl-play').addEventListener('click', () => {
      chrome.tabs.create({ url: `https://www.imdb.com/title/${movie.imdbId}/?play=1` });
    });

    card.querySelector('.wl-remove').addEventListener('click', () => {
      card.classList.add('removing');
      getWatchlist(list => {
        setWatchlist(list.filter(m => m.imdbId !== movie.imdbId), () => {
          updateWatchlistBtn();
        });
      });
      setTimeout(() => {
        card.remove();
        renderWatchlist();
      }, 200);
    });

    return card;
  }

  function updateWatchlistBtn() {
    if (!currentMovie) return;
    getWatchlist(list => {
      const inList = list.some(m => m.imdbId === currentMovie.imdbId);
      qaWatchlist.classList.toggle('wl-active', inList);
      watchlistText.textContent = inList ? 'Remove from list' : 'Add to Watchlist';
    });
  }

  qaWatchlist.addEventListener('click', () => {
    if (!currentMovie) return;
    getWatchlist(list => {
      const inList = list.some(m => m.imdbId === currentMovie.imdbId);
      let newList;
      if (inList) {
        newList = list.filter(m => m.imdbId !== currentMovie.imdbId);
      } else {
        newList = [currentMovie, ...list];
      }
      setWatchlist(newList, () => {
        updateWatchlistBtn();
        renderWatchlist();
      });
    });
  });

  /* ─── GitHub Updater & Versioning ──────────────────────── */
  const GITHUB_REPO = 'iamnvn/PlayIMDb';
  const manifest = chrome.runtime.getManifest();
  const currentVersion = manifest.version;

  const versionAbout = document.getElementById('versionAbout');
  const versionFooter = document.getElementById('versionFooter');
  const btnGithub = document.getElementById('btnGithub');
  const btnCheckUpdates = document.getElementById('btnCheckUpdates');

  if (versionAbout) versionAbout.textContent = `Version ${currentVersion}`;
  if (versionFooter) versionFooter.textContent = `v${currentVersion}`;
  if (btnGithub) btnGithub.href = `https://github.com/${GITHUB_REPO}`;

  if (btnCheckUpdates) {
    btnCheckUpdates.addEventListener('click', async () => {
      // If an update was found, this button turns into a link to the release page
      if (btnCheckUpdates.dataset.url) {
        chrome.tabs.create({ url: btnCheckUpdates.dataset.url });
        return;
      }

      const originalText = btnCheckUpdates.innerHTML;
      btnCheckUpdates.innerHTML = 'Checking...';
      btnCheckUpdates.disabled = true;

      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        // Strip 'v' prefix if present
        const latestTag = data.tag_name.replace(/^v/, '');
        
        // Compare semantic version (e.g., "1.0.1" > "1.0.0")
        if (latestTag > currentVersion) {
          btnCheckUpdates.innerHTML = `Update Available (v${latestTag})`;
          btnCheckUpdates.style.color = 'var(--accent)';
          btnCheckUpdates.style.borderColor = 'var(--accent)';
          btnCheckUpdates.dataset.url = data.html_url;
          btnCheckUpdates.disabled = false;
        } else {
          btnCheckUpdates.innerHTML = 'Up to date';
          setTimeout(() => {
            btnCheckUpdates.innerHTML = originalText;
            btnCheckUpdates.disabled = false;
          }, 2000);
        }
      } catch (error) {
        console.error('Update check failed:', error);
        btnCheckUpdates.innerHTML = 'Update check failed';
        setTimeout(() => {
          btnCheckUpdates.innerHTML = originalText;
          btnCheckUpdates.disabled = false;
        }, 2000);
      }
    });
  }

  /* ─── Populate movie info ──────────────────────────────── */
  function showDetected(info, tabId) {
    currentMovie = info;
    document.getElementById('noPageState').classList.add('hidden');
    document.getElementById('detectedState').classList.remove('hidden');

    document.getElementById('movieTitle').textContent = info.title || 'Unknown';
    document.getElementById('ratingText').textContent = (info.rating || 'N/A').replace(/\/10$/, '');
    const metaEl = document.getElementById('movieMeta');
    metaEl.textContent = info.meta || 'Details unavailable';
    document.getElementById('imdbIdText').textContent = info.imdbId;

    if (info.posterSrc) {
      const p = document.getElementById('moviePoster');
      p.style.backgroundImage = `url(${info.posterSrc})`;
      p.innerHTML = '';
    }

    const playBtn = document.getElementById('playBtnMain');
    const newTabBtn = document.getElementById('qaNewTab');
    playBtn.disabled = false;
    newTabBtn.disabled = false;
    qaWatchlist.disabled = false;

    let videoUrl = `https://proxy.garageband.rocks/embed/movie/${info.imdbId}`;
    if (info.media_type === 'video.tv_show' || info.media_type === 'video.episode') {
      videoUrl = `https://proxy.garageband.rocks/embed/tv/${info.imdbId}?autonext=1`;
    }

    // Clone to strip old listeners
    const pb2 = playBtn.cloneNode(true);
    playBtn.replaceWith(pb2);
    pb2.addEventListener('click', () => {
      if (tabId) chrome.tabs.sendMessage(tabId, { action: 'open_player', url: videoUrl });
      else chrome.tabs.create({ url: videoUrl });
      window.close();
    });

    const nt2 = newTabBtn.cloneNode(true);
    newTabBtn.replaceWith(nt2);
    nt2.addEventListener('click', () => chrome.tabs.create({ url: videoUrl }));

    const cp = document.getElementById('copyId');
    const cp2 = cp.cloneNode(true);
    cp.replaceWith(cp2);
    cp2.addEventListener('click', () => {
      navigator.clipboard.writeText(info.imdbId).catch(() => { });
      const el = document.getElementById('imdbIdText');
      el.textContent = 'Copied!';
      setTimeout(() => { el.textContent = info.imdbId; }, 1500);
    });

    updateWatchlistBtn();
  }

  function showNoPage() {
    document.getElementById('noPageState').classList.remove('hidden');
    document.getElementById('detectedState').classList.add('hidden');
  }

  /* ─── Bootstrap ────────────────────────────────────────── */
  renderWatchlist();

  // Scrape the live tab or show No Page state
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    const isImdb = tab && tab.url && tab.url.includes('imdb.com/title/');

    if (!isImdb) {
      showNoPage();
      return;
    }

    function handleDetected(movieData) {
      if (!movieData) {
        showNoPage();
        return;
      }
      showDetected(movieData, tab.id);

      // Auto-heal watchlist with missing or old meta
      chrome.storage.local.get({ watchlist: [] }, wlData => {
        let updated = false;
        const newList = wlData.watchlist.map(m => {
          if (m.imdbId === movieData.imdbId && m.meta !== movieData.meta) {
            updated = true;
            return { ...m, meta: movieData.meta, title: movieData.title, posterSrc: movieData.posterSrc };
          }
          return m;
        });
        if (updated) {
          chrome.storage.local.set({ watchlist: newList }, () => {
            renderWatchlist();
          });
        }
      });
    }

    // Request fresh info from the active tab's content script
    chrome.tabs.sendMessage(tab.id, { action: 'get_movie_info' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // Fallback to storage in case content script isn't responsive
        chrome.storage.local.get(['lastMovie'], d => {
          if (d.lastMovie && tab.url.includes(d.lastMovie.imdbId)) {
            handleDetected(d.lastMovie);
          } else {
            showNoPage();
          }
        });
        return;
      }
      handleDetected(response);
    });
  });
});
